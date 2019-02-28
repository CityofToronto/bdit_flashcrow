"""
ora2json.py

Parse Oracle schemas into a normalized JSON representation describing the table name,
columns, and constraints.
"""
import json
import re
import sys

from replication_utils import ConstraintType, get_table_config, parse_args

COLUMN_REGEX = re.compile(
  r'"(?P<name>[A-Z0-9_]+)" '
  r'(?P<type>CHAR|DATE|FLOAT|NUMBER|VARCHAR2)'
  r'(?:\((?P<type_args>[0-9,]+)\))?'
  r'(?: CONSTRAINT "(?P<constraint>[A-Z0-9_]+)")?'
  r'(?P<value> NOT NULL| DEFAULT (?:0|NULL))?')
CONSTRAINT_NAME_REGEX = re.compile(
  r'CONSTRAINT "([A-Z0-9_]+)"')
CONSTRAINT_PK_REGEX = re.compile(
  r'PRIMARY KEY \("([A-Z0-9_]+)"\)')
CONSTRAINT_FK_REGEX = re.compile(
  r'FOREIGN KEY \("([A-Z0-9_]+)"\)')
CONSTRAINT_UNIQUE_REGEX = re.compile(
  r'UNIQUE \("([A-Z0-9_]+)"\)')

def parse_table(args, line):
  """
  Parse a 'CREATE TABLE' statement, extracting the table name.
  """
  table_regex = re.compile(
    r'CREATE TABLE "' + args.sourceSchema + r'"."([A-Z0-9_]+)"')
  match = table_regex.search(line)
  if match is None:
    raise TypeError('invalid table statement: {line}'.format(
      line=line))
  return match.group(1)

def get_pg_type(name, ora_type, ora_type_args):
  """
  Given the Oracle data type (e.g. FLOAT(126)), return the corresponding
  PostgreSQL data type (e.g. float8).
  """
  # TODO: allow configured overrides
  if ora_type == 'CHAR':
    if len(ora_type_args) != 1:
      raise TypeError('invalid CHAR arguments: {ora_type_args}'.format(
        ora_type_args=ora_type_args))
    return 'char({n})'.format(
      n=ora_type_args[0])
  elif ora_type == 'DATE':
    return 'date'
  elif ora_type == 'FLOAT':
    # TODO: consider size here
    return 'float8'
  elif ora_type == 'NUMBER':
    if ora_type_args is None:
      return 'float8'
    if len(ora_type_args) != 2 or ora_type_args[1] != '0':
      raise TypeError('invalid NUMBER arguments: {ora_type_args}'.format(
        ora_type_args=ora_type_args))
    n = int(ora_type_args[0])
    if n <= 4:
      return 'int2'
    if n <= 9:
      return 'int4'
    if n <= 18:
      return 'int8'
    return 'numeric({n},0)'.format(
      n=n)
  elif ora_type == 'VARCHAR2':
    if len(ora_type_args) != 1:
      raise TypeError('invalid VARCHAR arguments: {ora_type_args}'.format(
        ora_type_args=ora_type_args))
    return 'varchar({n})'.format(
      n=ora_type_args[0])
  else:
    raise TypeError('unexpected Oracle type for {name}: {ora_type}'.format(
      name=name,
      ora_type=ora_type))

def parse_column(line):
  """
  Parse a column within a 'CREATE TABLE' statement, extracting the
  column name, Oracle data type, and any type-modifying clauses (e.g.
  'NOT NULL', 'DEFAULT 0') or constraints ('CONSTRAINT ...').
  """
  match = COLUMN_REGEX.search(line)
  if match is None:
    raise TypeError('invalid column statement: {line}'.format(
      line=line))
  name = match.group('name')
  ora_type = match.group('type')
  ora_type_args = match.group('type_args')
  if ora_type_args is not None:
    ora_type_args = tuple(ora_type_args.split(','))
  pg_type = get_pg_type(name, ora_type, ora_type_args)
  constraint = match.group('constraint')
  value = match.group('value')
  return {
    'name': name,
    'ora_type': ora_type,
    'ora_type_args': ora_type_args,
    'pg_type': pg_type,
    'constraint': constraint,
    'value': value
  }

def parse_constraint(args, constraint_lines):
  """
  Parse a constraint clause.  These clauses are often spread across two or more lines, and
  the exact syntax varies depending on the constraint type ('PRIMARY KEY', 'UNIQUE', etc.)

  We also handle Oracle's 'DISABLE' clause, which disables the constraint in question.  In
  that case, this will return None to signal that the constraint is not to be reflected in
  the PostgreSQL DDL output.
  """
  if not constraint_lines:
    raise RuntimeError('expected at least one line in constraint')
  match = CONSTRAINT_NAME_REGEX.search(constraint_lines[0])
  if match is None:
    raise RuntimeError('expected CONSTRAINT line at beginning, got {line}'.format(
      line=constraint_lines[0]))
  constraint = {
    'name': match.group(1),
    'constraint_type': None,
    'column_name': None
  }
  for line in constraint_lines:
    if 'DISABLE' in line:
      # this constraint is disabled, drop it
      return None
    if 'USING INDEX ENABLE' in line:
      # this constraint is enabled
      continue
    elif 'PRIMARY KEY' in line:
      match = CONSTRAINT_PK_REGEX.search(line)
      if match is None:
        raise RuntimeError('invalid PRIMARY KEY declaration: {line}'.format(
          line=line))
      constraint['constraint_type'] = ConstraintType.PRIMARY_KEY
      constraint['column_name'] = match.group(1)
    elif 'FOREIGN KEY' in line:
      match = CONSTRAINT_FK_REGEX.search(line)
      if match is None:
        raise RuntimeError('invalid FOREIGN KEY declaration: {line}'.format(
          line=line))
      constraint['constraint_type'] = ConstraintType.FOREIGN_KEY
      constraint['column_name'] = match.group(1)
    elif constraint['constraint_type'] == ConstraintType.FOREIGN_KEY:
      # second line of FOREIGN KEY constraint
      constraint_fk_regex_2 = re.compile(
        r'REFERENCES "' + args.sourceSchema + r'"."([A-Z0-9_]+)" \("([A-Z0-9_]+)"\)')
      match = constraint_fk_regex_2.search(line)
      if match is None:
        raise RuntimeError('invalid FOREIGN KEY declaration: {line}'.format(
          line=line))
      constraint['fk_table'] = match.group(1)
      constraint['fk_column'] = match.group(2)
    elif 'UNIQUE' in line:
      match = CONSTRAINT_UNIQUE_REGEX.search(line)
      if match is None:
        raise RuntimeError('invalid UNIQUE declaration: {line}'.format(
          line=line))
      constraint['constraint_type'] = ConstraintType.UNIQUE
      constraint['column_name'] = match.group(1)
  if constraint['constraint_type'] is None:
    raise RuntimeError('could not determine constraint type: {constraint}'.format(
      constraint='\n'.join(constraint_lines)))
  if constraint['column_name'] is None:
    raise RuntimeError('could not determine constraint column: {constraint}'.format(
      constraint='\n'.join(constraint_lines)))
  return constraint

def get_chunk_by_index(chunk_by, columns):
  """
  Given the column to chunk by, return the index of the column in the filtered
  set of columns (i.e. after exclusions are applied).
  """
  for i, column in enumerate(c for c in columns if not c['exclude']):
    if column['name'] == chunk_by:
      return i
  raise RuntimeError('chunkBy column not found')

def generate_ora_json(args, table_name, columns, constraints):
  """
  Generate the final parsed JSON representation by merging the table config with the
  results of parsing Oracle DDL.
  """
  table_config = get_table_config(args, table_name)
  for column in columns:
    column['exclude'] = column['name'] in table_config['exclude']
  for column in constraints:
    column['exclude'] = column['column_name'] in table_config['exclude']
  chunk_by = table_config['chunkBy']
  chunk_numeric = table_config['chunkNumeric']
  ora_json = {
    'table_name': table_name,
    'chunk_by': chunk_by,
    'chunk_numeric': chunk_numeric,
    'columns': columns,
    'constraints': constraints
  }
  ora_json['chunk_by_index'] = get_chunk_by_index(chunk_by, columns)
  return ora_json

def main():
  """
  Read Oracle DDL from stdin, write parsed JSON representation.  The output of this is intended
  to be run through these scripts:

  - json2pg.py: converts output to a 'CREATE TABLE' statement suitable for creating the remote
    RDS table.
  - json2pglocal.py: converts output to a 'CREATE FOREIGN TABLE' statement suitable for loading
    data from the Oracle source on zodiac.
  - json2sql.py: converts output to the beginning of a 'SELECT ...' query suitable for fetching
    chunks from the foreign table.
  """
  description = 'Convert Oracle DDL to parsed JSON representation'
  args = parse_args(description)

  # main state
  table_name = None
  columns = []
  constraints = []

  # state of current constraint
  constraint_lines = []
  in_constraints = False

  # parse Oracle DDL, line by line
  # assume that order is TABLE, then columns, then CONSTRAINTs
  for line in sys.stdin:
    line = ' '.join(line.strip().split())
    if not line:
      # ignore empty lines
      continue
    if 'CREATE TABLE' in line:
      table_name = parse_table(args, line)
    elif line.startswith('CONSTRAINT'):
      # first line of a constraint
      in_constraints = True
      if constraint_lines:
        constraint = parse_constraint(args, constraint_lines)
        if constraint is not None:
          constraints.append(constraint)
        constraint_lines = []
      constraint_lines.append(line)
    elif line in (') ;', ')'):
      # TODO: handle PARTITION clauses
      # last line of query
      if constraint_lines:
        constraint = parse_constraint(args, constraint_lines)
        if constraint is not None:
          constraints.append(constraint)
        constraint_lines = []
      ora_json = generate_ora_json(args, table_name, columns, constraints)
      print(json.dumps(ora_json, indent=2))
      break
    elif in_constraints:
      # subsequent line of a constraint
      constraint_lines.append(line)
    else:
      # line for column
      column = parse_column(line)
      columns.append(column)

if __name__ == '__main__':
  main()
