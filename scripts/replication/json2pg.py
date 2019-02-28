"""
json2pg.py

Convert parsed JSON representation schema to its PostgreSQL RDS equivalent.
"""
import json
import sys

from replication_utils import ConstraintType, generate_column_sql, parse_args

def generate_table_sql(args, table_name):
  """
  Given the table name as returned by parse_table(), return the first 'CREATE TABLE' line
  of the corresponding PostgreSQL DDL statement.
  """
  return 'CREATE TABLE "{targetSchema}"."{table_name}"'.format(
    table_name=table_name,
    targetSchema=args.targetSchema)

def generate_constraint_sql(args, constraint):
  """
  Given a constraint as returned by parse_constraint(), return the corresponding constraint
  clause in the PostgreSQL DDL statement.
  """
  constraint_type = constraint['constraint_type']
  if constraint_type == ConstraintType.PRIMARY_KEY:
    return 'PRIMARY KEY ("{column_name}")'.format(**constraint)
  elif constraint_type == ConstraintType.FOREIGN_KEY:
    fk_format = (
      'FOREIGN KEY ("{column_name}") '
      'REFERENCES "{targetSchema}"."{fk_table}" ("{fk_column}")')
    return fk_format.format(
      targetSchema=args.targetSchema,
      **constraint)
  elif constraint_type == ConstraintType.UNIQUE:
    return 'UNIQUE ("{column_name}")'.format(**constraint)
  else:
    raise RuntimeError('invalid constraint type: {constraint_type}'.format(
      **constraint))

def generate_pg_sql(args, table_name, columns, constraints):
  """
  Generate the PostgreSQL DDL statement, based on the values returned by parse_table(),
  parse_column(), and parse_constraint().  This internally calls the other
  generate_*_sql() functions to build the corresponding parts of the DDL statement.
  """
  columns = list(filter(lambda c: not c['exclude'], columns))
  constraints = list(filter(lambda c: not c['exclude'], constraints))

  table_sql = generate_table_sql(args, table_name)
  column_sqls = map(generate_column_sql, columns)
  column_sql = '\n, '.join(column_sqls)
  if not constraints:
    constraint_sql = ''
  else:
    constraint_sqls = map(
      lambda c: generate_constraint_sql(args, c),
      constraints)
    constraint_sql = '\n, '.join(constraint_sqls)
    constraint_sql = '\n, ' + constraint_sql
  return '''\
{table_sql} (
  {column_sql}{constraint_sql}
);'''.format(
  table_sql=table_sql,
  column_sql=column_sql,
  constraint_sql=constraint_sql)

def main():
  """
  Read JSON representation from stdin, write PostgreSQL DDL to stdout.  The output of this is
  intended to be run on our AWS PostgreSQL RDS.  To create DDL that can be run against the
  local replication helper database, use json2pglocal.py on the JSON representation.  That
  will convert it to a 'CREATE FOREIGN TABLE' statement suitable for loading data from the
  Oracle source on zodiac.
  """
  description = 'Convert parsed JSON representation to PostgreSQL RDS DDL'
  args = parse_args(description)
  ora_json = json.load(sys.stdin)
  pg_sql = generate_pg_sql(
    args,
    ora_json['table_name'],
    ora_json['columns'],
    ora_json['constraints'])
  print(pg_sql)

if __name__ == '__main__':
  main()
