"""
json2pglocal.py

Convert parsed JSON representation to its FOREIGN TABLE equivalent.
"""
import json
import sys

from replication_utils import generate_column_sql, parse_args

def generate_foreign_table_sql(args, table_name):
  """
  Given the table name as returned by parse_table(), return the first 'CREATE TABLE' line
  of the corresponding PostgreSQL DDL statement.
  """
  return 'CREATE FOREIGN TABLE "{targetSchema}"."{table_name}"'.format(
    table_name=table_name,
    targetSchema=args.targetSchema)

def generate_pg_local_sql(args, table_name, columns):
  """
  Generate the PostgreSQL DDL statement, based on the values returned by parse_table(),
  parse_column(), and parse_constraint().  This internally calls the other
  generate_*_sql() functions to build the corresponding parts of the DDL statement.
  """
  foreign_table_sql = generate_foreign_table_sql(args, table_name)
  column_sqls = map(generate_column_sql, columns)
  column_sql = '\n, '.join(column_sqls)
  return '''\
{foreign_table_sql} (
  {column_sql}
) SERVER zodiac OPTIONS (schema '{schema}', table '{table}');'''.format(
  foreign_table_sql=foreign_table_sql,
  column_sql=column_sql,
  schema=args.sourceSchema,
  table=table_name)

def main():
  """
  Read JSON representation from stdin, write PostgreSQL DDL to stdout.  The output of this is
  intended to be run on our AWS PostgreSQL RDS.  To create DDL that can be run against the
  local replication helper database, use json2pglocal.py on the JSON representation.  That
  will convert it to a 'CREATE FOREIGN TABLE' statement suitable for loading data from the
  Oracle source on zodiac.
  """
  description = 'Convert parsed JSON representation to PostgreSQL FOREIGN TABLE DDL'
  args = parse_args(description)
  ora_json = json.load(sys.stdin)
  pg_local_sql = generate_pg_local_sql(
    args,
    ora_json['table_name'],
    ora_json['columns'])
  print(pg_local_sql)

if __name__ == '__main__':
  main()
