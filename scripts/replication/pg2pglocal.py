"""
pg2pglocal.py

Convert PostgreSQL schemas to their FOREIGN TABLE equivalents.
"""
import argparse
import sys

def main():
  """
  Parse command-line arguments, then find-replace to build the CREATE FOREIGN
  TABLE DDL statement.
  """
  parser = argparse.ArgumentParser(
    description='Convert PostgreSQL schemas to their FOREIGN TABLE equivalents.')
  parser.add_argument(
    '--sourceSchema',
    type=str,
    default='TRAFFIC',
    help='Schema where data is read from in Oracle source')
  parser.add_argument(
    '--sourceTable',
    type=str,
    help='Table where data is read from in Oracle source')
  args = parser.parse_args()

  sql = sys.stdin.read()

  # add foreign table declarations
  sql = sql.replace('CREATE TABLE', 'CREATE FOREIGN TABLE')
  sql = sql.replace(');', ") SERVER zodiac OPTIONS (schema '{schema}', table '{table}');".format(
    schema=args.sourceSchema,
    table=args.sourceTable))

  # comment out constraints that are not supported on foreign tables
  sql = sql.replace(', FOREIGN KEY', '-- , FOREIGN KEY')
  sql = sql.replace(', PRIMARY KEY', '-- , PRIMARY KEY')
  sql = sql.replace(', UNIQUE', '-- , UNIQUE')

  sys.stdout.write(sql)

if __name__ == '__main__':
  main()
