from enum import Enum
import re
import sys

TABLE_REGEX = re.compile(
  r'CREATE TABLE "TRAFFIC"."([A-Z0-9_]+)"')
COLUMN_REGEX = re.compile(
  r'"(?P<name>[A-Z0-9_]+)" (?P<type>NUMBER|VARCHAR2)(?:\((?P<type_args>[0-9,]+)\))?(?: CONSTRAINT "(?P<constraint>[A-Z0-9_]+)")?(?P<value> NOT NULL|DEFAULT NULL)?')
CONSTRAINT_NAME_REGEX = re.compile(
  r'CONSTRAINT "([A-Z0-9_]+)"')
CONSTRAINT_PK_REGEX = re.compile(
  r'PRIMARY KEY \("([A-Z0-9_]+)"\)')
CONSTRAINT_FK_REGEX = re.compile(
  r'FOREIGN KEY \("([A-Z0-9_]+)"\)')
CONSTRAINT_FK_REGEX_2 = re.compile(
  r'REFERENCES "TRAFFIC"."([A-Z0-9_]+)" \("([A-Z0-9_]+)"\)')
CONSTRAINT_UNIQUE_REGEX = re.compile(
  r'UNIQUE \("([A-Z0-9_]+)"\)')

def parse_table(line):
  match = TABLE_REGEX.search(line)
  if match is None:
    raise TypeError('invalid table statement: {line}'.format(
      line = line))
  return match.group(1)

def get_pg_type(name, ora_type, ora_type_args):
  # TODO: allow configured overrides
  if ora_type == 'NUMBER':
    # TODO: consider size here
    return 'int8'
  elif ora_type == 'VARCHAR2':
    if len(ora_type_args) != 1:
      raise TypeError('invalid VARCHAR arguments: {ora_type_args}'.format(
        ora_type_args = ora_type_args))
    return 'varchar({n})'.format(
      n = ora_type_args[0])
  else:
    raise TypeError('unexpected Oracle type for {name}: {ora_type}'.format(
      name = name,
      ora_type = ora_type))

def parse_column(line):
  match = COLUMN_REGEX.search(line)
  if match is None:
    raise TypeError('invalid column statement: {line}'.format(
      line = line))
  name = match.group('name')
  ora_type = match.group('type')
  ora_type_args = tuple(match.group('type_args').split(','))
  pg_type = get_pg_type(name, ora_type, ora_type_args)
  constraint = match.group('constraint')
  value = match.group('value')
  return {
    'name': name,
    'ora_type': ora_type,
    'ora_type_args': ora_type_args,
    'pg_type': pg_type,
    'constraint': constraint,
    'value': value,
    'primary_key': False,
    'unique': False
  }

class ConstraintType(Enum):
  PRIMARY_KEY = 1
  FOREIGN_KEY = 2
  UNIQUE = 3

def parse_constraint(constraint_lines):
  if not constraint_lines:
    raise RuntimeError('expected at least one line in constraint')
  match = CONSTRAINT_NAME_REGEX.search(constraint_lines[0])
  if match is None:
    raise RuntimeError('expected CONSTRAINT line at beginning, got {line}'.format(
      line = constraint_lines[0]))
  constraint = {
    'name': match.group(1),
    'constraint_type': None,
    'column_name': None,
    'metadata': {}
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
          line = line))
      constraint['constraint_type'] = ConstraintType.PRIMARY_KEY
      constraint['column_name'] = match.group(1)
    elif 'FOREIGN KEY' in line:
      match = CONSTRAINT_FK_REGEX.search(line)
      if match is None:
        raise RuntimeError('invalid FOREIGN KEY declaration: {line}'.format(
          line = line))
      constraint['constraint_type'] = ConstraintType.FOREIGN_KEY
    elif constraint['constraint_type'] == ConstraintType.FOREIGN_KEY:
      # second line of FOREIGN KEY constraint
      match = CONSTRAINT_FK_REGEX_2.search(line)
      if match is None:
        raise RuntimeError('invalid FOREIGN KEY declaration: {line}'.format(
          line = line))
      constraint['metadata'] = {
        'fk_table': match.group(1),
        'fk_column': match.group(2)
      }
    elif 'UNIQUE' in line:
      match = CONSTRAINT_UNIQUE_REGEX.search(line)
      if match is None:
        raise RuntimeError('invalid UNIQUE declaration: {line}'.format(
          line = line))
      constraint['constraint_type'] = ConstraintType.UNIQUE
      constraint['column_name'] = match.group(1)
  if constraint['constraint_type'] is None:
    raise RuntimeError('could not determine constraint type: {constraint}'.format(
      constraint = '\n'.join(constraint_lines)))
  if constraint['column_name'] is None:
    raise RuntimeError('could not determine constraint column: {constraint}'.format(
      constraint = '\n'.join(constraint_lines)))
  return constraint

def find_column(columns, column_name):
  for column in columns:
    if column['name'] == column_name:
      return column
  return None

def process_constraint(columns, constraint):
  # TODO: handle constraints that can't be attached to a specific column
  constraint_type = constraint['constraint_type']
  column_name = constraint['column_name']
  column = find_column(columns, column_name)
  if column is None:
    raise RuntimeError('no such column: {column_name}'.format(
      column_name = column_name))
  if constraint_type == ConstraintType.PRIMARY_KEY:
    column['primary_key'] = True
  elif constraint_type == ConstraintType.UNIQUE:
    column['unique'] = True

def generate_table_sql(table_name):
  return 'CREATE FOREIGN TABLE TRAFFIC.{table_name}'.format(
    table_name = table_name)

def generate_column_sql(column):
  column_sql = '{name} {pg_type}'.format(**column)
  if column['primary_key']:
    column_sql += ' PRIMARY KEY'
  if column['unique']:
    column_sql += ' UNIQUE'
  if column['value'] is not None:
    column_sql += column['value']
  return column_sql

def generate_pg_sql(table_name, columns):
  table_sql = generate_table_sql(table_name)
  column_sqls = map(generate_column_sql, columns)
  return '''\
{table_sql} (
  {column_sql}
) SERVER zodiac OPTIONS (schema 'TRAFFIC', table '{table_name}');'''.format(
  table_name = table_name,
  table_sql = table_sql,
  column_sql = ',\n  '.join(column_sqls))

# main state
table_name = None
columns = []

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
    table_name = parse_table(line)
  elif line.startswith('CONSTRAINT'):
    # first line of a constraint
    in_constraints = True
    if constraint_lines:
      constraint = parse_constraint(constraint_lines)
      if constraint is not None:
        process_constraint(columns, constraint)
      constraint_lines = []
    constraint_lines.append(line)
  elif ') ;' in line:
    # last line of query
    if constraint_lines:
      constraint = parse_constraint(constraint_lines)
      if constraint is not None:
        process_constraint(columns, constraint)
      constraint_lines = []
    pg_sql = generate_pg_sql(table_name, columns)
    print(pg_sql)
    break
  elif in_constraints:
    # subsequent line of a constraint
    constraint_lines.append(line)
  else:
    # line for column
    column = parse_column(line)
    columns.append(column)
