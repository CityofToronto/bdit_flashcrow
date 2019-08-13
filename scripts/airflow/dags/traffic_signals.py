"""
Pipeline for pulling traffic signal data
"""
from datetime import datetime
import os
import sys
import psycopg2
from airflow import DAG
from airflow.operators.bash_operator import BashOperator
from airflow.operators.python_operator import PythonOperator

# since `pull_traffic_signal_functions.py` does not exist in this dir
# we need to put a try block around it so the linter wont think its an error
try:
  sys.path.append('/home/ec2-user/flashcrow/scripts/airflow/tasks/pull_traffic_signals/')
  from pull_traffic_signal_functions import add_geometry, create_tables, insert_into_table
except:
  raise ImportError("Cannot import functions to pull traffic signals")

AIRFLOW_DAGS = os.path.dirname(os.path.realpath(__file__))
AIRFLOW_ROOT = os.path.dirname(AIRFLOW_DAGS)
AIRFLOW_TASKS = os.path.join(AIRFLOW_ROOT, 'tasks')

DEFAULT_ARGS = {
    'email': ['Chelsea.Rosic@toronto.ca'],
    'email_on_failure': True,
    'email_on_retry': True,
    'owner': 'ec2-user',
    'start_date': datetime(2019, 7, 9),
    'task_concurrency': 1
}

TRAFFIC_SIGNAL_DAG = DAG(
    'traffic_signals',
    default_args=DEFAULT_ARGS,
    max_active_runs=1,
    schedule_interval='10 6-22 * * 1-5')

def pull_traffic_signals():
  '''
  create tables to put traffic signals into,
  pull traffic signals from the open data portal,
  and add geometry columns to the traffic signal tables
  '''
  db_name = 'flashcrow'
  username = 'flashcrow'
  host = 'fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com'

  try:
    conn = psycopg2.connect(database=db_name, user=username, host=host)
  except:
    raise Exception('Could not connect to Flashcrow DB')

  create_tables(conn)
  insert_into_table("gis.traffic_signals",
                    "656fdd0a-f5a2-4936-a02c-62c5a250d38e",
                    "traffic-signals-all-version-2-json.json",
                    conn)
  insert_into_table("gis.pedestrian_crossings",
                    "17d0fd03-c1b5-410f-9dd0-7837d28ac0a7",
                    "pedestrian-crossovers-version-2-json.json",
                    conn
                    )

  add_geometry("gis.traffic_signals", conn)
  add_geometry("gis.pedestrian_crossings", conn)

  conn.close()


PULL_TRAFFIC_SIGNALS = PythonOperator(
    task_id='pull_traffic_signals',
    python_callable=pull_traffic_signals,
    dag=TRAFFIC_SIGNAL_DAG
)

CREATE_SIGNAL_QUERY_TABLES_SH = os.path.join(AIRFLOW_TASKS, 'create_signal_query_tables.sh')
CREATE_SIGNAL_QUERY_TABLES = BashOperator(
    task_id='create_signal_query_tables',
    bash_command='{0} '.format(CREATE_SIGNAL_QUERY_TABLES_SH),
    dag=TRAFFIC_SIGNAL_DAG
)
