"""
autovacuum_cleanup

A maintenance workflow that runs `VACUUM ANALYZE` nightly on all materialized views in
the MOVE database, to mitigate service degradation and/or downtime due to autovacuum
operations.
"""
from datetime import datetime

from airflow_utils import create_dag, create_bash_task_nested

START_DATE = datetime(2020, 8, 19)
SCHEDULE_INTERVAL = '0 23 * * *'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

AUTOVACUUM_CLEANUP = create_bash_task_nested(DAG, 'autovacuum_cleanup')
