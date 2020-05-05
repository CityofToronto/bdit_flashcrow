"""
airflow_utils.py

Provides `create_dag` for easy DAG generation, and `create_bash_tasks` for easy
`BashOperator`-based task generation.

Also adds the
"""
import os
import sys

from airflow import DAG
from airflow.operators.bash_operator import BashOperator

AIRFLOW_DAGS = os.path.dirname(os.path.realpath(__file__))
AIRFLOW_ROOT = os.path.dirname(AIRFLOW_DAGS)
AIRFLOW_TASKS = os.path.join(AIRFLOW_ROOT, 'tasks')
AIRFLOW_TASKS_LIB = os.path.join(AIRFLOW_TASKS, 'lib')

# Some tasks rely on Python libraries within the `tasks/lib` folder, so
# we add that to the path here.
sys.path.append(AIRFLOW_TASKS_LIB)

def create_dag(filepath, doc, start_date, schedule_interval):
  """
  Creates an Airflow DAG with our default parameters.

  You should call this from within your DAG file as follows:

      import airflow_utils

      dag = airflow_utils.create_dag(__file__, __doc__, start_date, schedule_interval)
      with dag:
        # initialize tasks
        pass

  This function imposes the convention that a DAG file with name
  `my_dag.py` has ID `my_dag`.
  """
  default_args = {
    # When on, `depends_on_past` freezes progress if a previous run failed.
    # This isn't ideal for our use case, so we disable it here.
    'depends_on_past': False,
    'email': ['move-ops@toronto.ca'],
    'email_on_failure': True,
    'email_on_retry': True,
    'owner': 'ec2-user',
    'start_date': start_date
  }

  # Auto-infer DAG ID from filename.
  dag_id = os.path.basename(filepath).replace('.pyc', '').replace('.py', '')
  dag = DAG(
    dag_id,
    default_args=default_args,
    # This avoids Airflow's default catchup behavior, which can be surprising.
    # Since our pipelines tend to operate non-incrementally, turning this off
    # makes more sense.
    catchup=False,
    # Prevent the same DAG from running concurrently more than once.
    max_active_runs=1,
    schedule_interval=schedule_interval,
    # This allows us to simplify `create_bash_task` below.
    template_searchpath=AIRFLOW_TASKS
  )
  # Use the module docstring to generate documentation for the Airflow DAG.
  dag.doc_md = doc
  return dag

def create_bash_task(dag, task_id):
  """
  Creates a new `BashOperator` task that runs a script with name `{task_id}.sh`
  in the `tasks` folder.  This `tasks` folder is expected to be in the same
  parent directory within the git repository as `dags`.
  """
  return BashOperator(
    task_id=task_id,
    bash_command='/{task_id}.sh'.format(task_id=task_id),
    dag=dag
  )

def create_bash_task_nested(dag, task_id):
  """
  Creates a new `BashOperator` task that runs a script with name `{task_id}.sh`
  in the folder `tasks/{dag_id}` folder.  This `tasks` folder is expected to be
  in the same parent directory within the git repository as `dags`.
  """
  return BashOperator(
    task_id=task_id,
    bash_command='/{dag_id}/{task_id}.sh'.format(
      dag_id=dag.dag_id,
      task_id=task_id
    ),
    dag=dag
  )
