"""
conflate_artery_centreline

Use arterycode matching information and processes as built by Aakash (Big Data)
to link counts with the Toronto centreline.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task_nested

START_DATE = datetime(2020, 5, 5)
SCHEDULE_INTERVAL = '30 4 * * *'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

A1_CENTRELINE_FILTERED = create_bash_task_nested(DAG, 'A1_centreline_filtered')
A2_NODES_CORRECTED = create_bash_task_nested(DAG, 'A2_nodes_corrected')
A3_NODES_INTERSECTION = create_bash_task_nested(DAG, 'A3_nodes_intersection')
A4_ARTERIES_MANUAL_CORR = create_bash_task_nested(DAG, 'A4_arteries_manual_corr')
B1_ARTERIES_INTERSECTION_MANUAL_CORR = create_bash_task_nested(
  DAG,
  'B1_arteries_intersection_manual_corr'
)
B2_ARTERIES_INTERSECTION_INT_ID = create_bash_task_nested(DAG, 'B2_arteries_intersection_int_id')
B3_ARTERIES_INTERSECTION = create_bash_task_nested(DAG, 'B3_arteries_intersection')
C1_ARTERIES_MIDBLOCK_MANUAL_CORR = create_bash_task_nested(DAG, 'C1_arteries_midblock_manual_corr')
C2_ARTERIES_MIDBLOCK_INT_ID = create_bash_task_nested(DAG, 'C2_arteries_midblock_int_id')
C3_ARTERIES_MIDBLOCK_GEO_ID = create_bash_task_nested(DAG, 'C3_arteries_midblock_geo_id')
C4_ARTERIES_MIDBLOCK = create_bash_task_nested(DAG, 'C4_arteries_midblock')

A1_CENTRELINE_FILTERED >> A2_NODES_CORRECTED
A2_NODES_CORRECTED >> A3_NODES_INTERSECTION
A3_NODES_INTERSECTION >> A4_ARTERIES_MANUAL_CORR

A4_ARTERIES_MANUAL_CORR >> B1_ARTERIES_INTERSECTION_MANUAL_CORR
B1_ARTERIES_INTERSECTION_MANUAL_CORR >> B2_ARTERIES_INTERSECTION_INT_ID
B2_ARTERIES_INTERSECTION_INT_ID >> B3_ARTERIES_INTERSECTION

A4_ARTERIES_MANUAL_CORR >> C1_ARTERIES_MIDBLOCK_MANUAL_CORR
C1_ARTERIES_MIDBLOCK_MANUAL_CORR >> C2_ARTERIES_MIDBLOCK_INT_ID
C2_ARTERIES_MIDBLOCK_INT_ID >> C3_ARTERIES_MIDBLOCK_GEO_ID
C3_ARTERIES_MIDBLOCK_GEO_ID >> C4_ARTERIES_MIDBLOCK
