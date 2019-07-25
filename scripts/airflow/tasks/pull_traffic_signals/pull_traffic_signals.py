'''
Pull traffic signals (including pedestrian crossings) from Open Data API
'''
from time import sleep
import psycopg2
from psycopg2.extras import execute_values
import requests

def create_tables():
  """
  Make the Postgres database and create the table.
  """

  signal_tablename = 'gis.traffic_signals'
  ped_crossing_tablename = 'gis.pedestrian_crossings'

  curr = CONN.cursor()
  create_signal_table = """
            DROP TABLE IF EXISTS %s;
            CREATE TABLE %s
            (
                px TEXT, 
                main TEXT,
                midblock TEXT,
                side1 TEXT,
                side2 TEXT,
                private_access TEXT,
                additional_info TEXT,
                geo_id TEXT, 
                nodeid TEXT,
                x NUMERIC,
                y NUMERIC,
                lat NUMERIC,
                long NUMERIC,
                activation_date TEXT, 
                signal_system TEXT, 
                non_system TEXT, 
                mode_of_control TEXT,
                ped_walk_speed TEXT,
                aps NUMERIC,
                transit_preempt NUMERIC,
                fire_preempt NUMERIC,
                rail_preempt NUMERIC,
                no_of_signalized_approaches NUMERIC, 
                ups NUMERIC, 
                led_blackout_sign NUMERIC,
                leading_pedestrian_intervals NUMERIC, 
                bicycle_signal NUMERIC
            );
            """ % (signal_tablename, signal_tablename)
  curr.execute(create_signal_table)


  create_ped_table = """
            DROP TABLE IF EXISTS %s;
            CREATE TABLE %s
            (
                id NUMERIC,
                px TEXT, 
                main TEXT,
                midblock TEXT,
                side1 TEXT,
                side2 TEXT,
                private_access TEXT,
                additional_info TEXT,
                geo_id TEXT, 
                nodeid TEXT,
                x NUMERIC,
                y NUMERIC,
                lat NUMERIC,
                long NUMERIC,
                activation_date TEXT
            );
            """ % (ped_crossing_tablename, ped_crossing_tablename)

  curr.execute(create_ped_table)

  CONN.commit()

def insert_into_table(output_table, params):
  '''
  Pull from Open Data API and insert the JSON into DB
  '''

  result = requests.get(
    "https://ckan0.cf.opendata.inter.sandbox-toronto.ca/api/3/action/package_show",
    params)

  while True:
    try:
      result = requests.get(
        "http://ckan0.cf.opendata.inter.sandbox-toronto.ca/api/3/action/package_show",
        params)
    except requests.exceptions.ConnectionError:
      sleep(10)
      continue
    else:
      return_json = result.json()
      break

  return_json = result.json()
  rows = []
  features = return_json['features']
  fields = return_json['fields']
  trials = [[field['name'], field['type']] for field in fields]
  for feature in features:
    row = [feature['attributes'][trial[0]] for trial in trials]
    rows.append(row)
  insert = 'INSERT INTO _{} VALUES %s'.format(output_table)
  with CONN:
    with CONN.cursor() as cur:
      execute_values(cur, insert, rows)

if __name__ == "__main__":
  DB_NAME = 'flashcrow'
  USERNAME = 'flashcrow'
  HOST = 'fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com'

  try:
    CONN = psycopg2.connect(database=DB_NAME, user=USERNAME, host=HOST)
  except:
    raise Exception('Could not connect to Flashcrow DB')

  create_tables()
  insert_into_table("gis.traffic_signals", {"id": "0d9b9ab2-0f81-42b1-9274-59875f3feda0"})
  insert_into_table('gis.pedestrian_crossings', {'id': '81a6a164-3824-4e6d-80ca-b67502fea264'})

  CONN.close()
