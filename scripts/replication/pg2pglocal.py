import argparse
import sys

parser = argparse.ArgumentParser(
  description = 'Convert Oracle schemas to PostgreSQL.')
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
sql = sql.replace(');', ") SERVER zodiac OPTIONS (schema '{sourceSchema}', table '{sourceTable}');".format(
  sourceSchema = args.sourceSchema,
  sourceTable = args.sourceTable))

# comment out constraints that are not supported on foreign tables
sql = sql.replace(', FOREIGN KEY', '-- , FOREIGN KEY')
sql = sql.replace(', PRIMARY KEY', '-- , PRIMARY KEY')
sql = sql.replace(', UNIQUE', '-- , UNIQUE')

sys.stdout.write(sql)
