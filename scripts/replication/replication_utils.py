"""
replication_utils.py

Common utility functions, classes, etc. used across all Python replication scripts.
"""
import argparse
import json

class ConstraintType:
  """
  Used to identify the type of constraint.  This also serves as a list of constraint
  types supported by this script.
  """
  PRIMARY_KEY = 1
  FOREIGN_KEY = 2
  UNIQUE = 3

def generate_column_sql(column):
  """
  Given a column definition as returned by parse_column(), return the corresponding column
  line in the PostgreSQL DDL statement.
  """
  column_sql = '"{name}" {pg_type}'.format(**column)
  if column['value'] is not None:
    column_sql += column['value']
  return column_sql

def get_table_config(args, table_name):
  """
  Given a table name, return the corresponding table-specific configuration from args.config,
  or raise ValueError if no such table configuration is present.
  """
  for table in args.config['tables']:
    if table['name'] == table_name:
      table.setdefault('exclude', [])
      return table
  raise ValueError('no such table in config: {table_name}'.format(
    table_name=table_name))

def parse_args(description):
  """
  Parse command-line arguments.
  """
  parser = argparse.ArgumentParser(description=description)
  parser.add_argument(
    '--config',
    type=str,
    required=True,
    help='Configuration to use ($config.config.json)')
  parser.add_argument(
    '--sourceSchema',
    type=str,
    default='TRAFFIC',
    help='Schema where data is read from in Oracle source')
  parser.add_argument(
    '--targetSchema',
    type=str,
    default='TRAFFIC_NEW',
    help='Schema where data is written to in PostgreSQL target')
  args = parser.parse_args()
  config_filename = '{0}.config.json'.format(args.config)
  with open(config_filename) as config_file:
    args.config = json.load(config_file)
  return args
