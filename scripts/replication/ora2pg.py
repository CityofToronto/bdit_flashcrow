import re
import sys

TABLE_REGEX = re.compile(
  r'CREATE TABLE "TRAFFIC"."([A-Z_]+)"')
COLUMN_REGEX = re.compile(
  r'"([A-Z_]+)" (NUMBER|VARCHAR2)(?:\(([0-9,]+)\))?')

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
  name = match.group(1)
  ora_type = match.group(2)
  ora_type_args = tuple(match.group(3).split(','))
  pg_type = get_pg_type(name, ora_type, ora_type_args)
  return {
    'name': name,
    'ora_type': ora_type,
    'ora_type_args': ora_type_args,
    'pg_type': pg_type
  }

def parse_constraint(constraint_lines):
  # TODO: actually process these in some way
  return constraint_lines

def process_constraint(constraint):
  pass

def generate_table_sql(table_name):
  return 'CREATE FOREIGN TABLE TRAFFIC.{table_name}'.format(
    table_name = table_name)

def generate_column_sql(column):
  return '{name} {pg_type}'.format(**column)

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

table_name = None
columns = []
constraint_lines = []
in_constraints = False

for line in sys.stdin:
  line = ' '.join(line.strip().split())
  if not line:
    # ignore empty lines
    continue
  if 'CREATE TABLE' in line:
    table_name = parse_table(line)
  elif 'CONSTRAINT' in line:
    # first line of a constraint
    in_constraints = True
    if constraint_lines:
      constraint = parse_constraint(constraint_lines)
      process_constraint(constraint)
      constraint_lines = []
    constraint_lines.append(line)
  elif ') ;' in line:
    # last line of query
    if constraint_lines:
      constraint = parse_constraint(constraint_lines)
      process_constraint(constraint)
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
