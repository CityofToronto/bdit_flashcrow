'''
Pull traffic signals (including pedestrian crossings) from Open Data API
'''
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
                aps_signal TEXT,
                aps_operation TEXT,
                aps_activation_date TEXT,
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

def insert_into_table(output_table, file_id, name):
  '''
  Pull from Open Data API and insert the JSON into DB
  '''

  url = "https://ckanadmin0.intra.prod-toronto.ca/dataset/1a106e88-f734-4179-b3fe-d690a6187a71" + \
        "/resource/" + file_id + "/download/" + name
  return_json = requests.get(url).json()

  rows = []
  for feature in return_json:
    row = [x for x in feature.values()]
    rows.append(row)
  insert = 'INSERT INTO {} VALUES %s'.format(output_table)
  with CONN:
    with CONN.cursor() as cur:
      execute_values(cur, insert, rows)



def add_geometry(update_table):
  """
  Add geometry columns to the traffic signal tables
  """
  curr = CONN.cursor()

  create_column = """
  ALTER TABLE %s ADD COLUMN geom geometry;
  """ % update_table

  add_geom = """
  UPDATE %s 
  SET geom = ST_SetSRID(ST_MakePoint(long, lat), 4326);
  """ % update_table

  add_index = """
  CREATE INDEX IF NOT EXISTS traffic_signal_geom ON %s USING GIST (geom);
  """ % update_table

  curr.execute(create_column)
  curr.execute(add_geom)
  curr.execute(add_index)

  CONN.commit()


if __name__ == "__main__":
  DB_NAME = 'flashcrow'
  USERNAME = 'flashcrow'
  HOST = 'fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com'

  try:
    CONN = psycopg2.connect(database=DB_NAME, user=USERNAME, host=HOST)
  except:
    raise Exception('Could not connect to Flashcrow DB')

  create_tables()
  insert_into_table("gis.traffic_signals",
                    "656fdd0a-f5a2-4936-a02c-62c5a250d38e",
                    "traffic-signals-all-version-2-json.json"
                    )
  insert_into_table("gis.pedestrian_crossings",
                    "17d0fd03-c1b5-410f-9dd0-7837d28ac0a7",
                    "pedestrian-crossovers-version-2-json.json"
                    )

  add_geometry("gis.traffic_signals")
  add_geometry("gis.pedestrian_crossings")

  CONN.close()
