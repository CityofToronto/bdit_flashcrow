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

# comment out primary keys
sql = sql.replace(', PRIMARY KEY', '-- , PRIMARY KEY')

sys.stdout.write(sql)
