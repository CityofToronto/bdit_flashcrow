"""
json2sql.py

Convert parsed JSON representation schema to SELECT SQL necessary for fetching all
non-excluded columns.
"""
import json
import sys

from replication_utils import parse_args

def generate_sql(args, chunk_by, table_name, columns):
  """
  Generate the PostgreSQL SELECT statement prefix based on the JSON representation.
  """
  column_names = ', '.join('\\"{0}\\"'.format(c['name']) for c in columns if not c['exclude'])
  # pylint: disable=line-too-long
  return 'SELECT {column_names} FROM \\"{targetSchema}\\".\\"{table_name}\\" WHERE \\"{chunk_by}\\" >'.format(
    column_names=column_names,
    targetSchema=args.targetSchema,
    table_name=table_name,
    chunk_by=chunk_by)

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
  sql = generate_sql(
    args,
    ora_json['chunk_by'],
    ora_json['table_name'],
    ora_json['columns'])
  print(sql)

if __name__ == '__main__':
  main()
