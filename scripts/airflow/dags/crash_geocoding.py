"""
crash_geocoding

Normalize CRASH data into collision "events" and collision "involved persons", then match
collision events to a centreline street segment or intersection.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task_nested

START_DATE = datetime(2019, 7, 17)
SCHEDULE_INTERVAL = '10 6-22 * * 1-5'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

A1_EVENTS_FIELDS_RAW = create_bash_task_nested(DAG, 'A1_events_fields_raw')
A2_EVENTS_FIELDS_NORM = create_bash_task_nested(DAG, 'A2_events_fields_norm')
A2_INVOLVED_FIELDS_RAW = create_bash_task_nested(DAG, 'A2_involved_fields_raw')
A3_INVOLVED_FIELDS_NORM = create_bash_task_nested(DAG, 'A3_involved_fields_norm')
A4_INVOLVED = create_bash_task_nested(DAG, 'A4_involved')
A5_EVENTS = create_bash_task_nested(DAG, 'A5_events')
A6_EVENTS_INTERSECTIONS = create_bash_task_nested(DAG, 'A6_events_intersections')
A6_EVENTS_SEGMENTS = create_bash_task_nested(DAG, 'A6_events_segments')
A7_EVENTS_CENTRELINE = create_bash_task_nested(DAG, 'A7_events_centreline')

A1_EVENTS_FIELDS_RAW >> A2_EVENTS_FIELDS_NORM
A1_EVENTS_FIELDS_RAW >> A2_INVOLVED_FIELDS_RAW
A2_EVENTS_FIELDS_NORM >> A3_INVOLVED_FIELDS_NORM
A2_INVOLVED_FIELDS_RAW >> A3_INVOLVED_FIELDS_NORM
A3_INVOLVED_FIELDS_NORM >> A4_INVOLVED
A4_INVOLVED >> A5_EVENTS
A5_EVENTS >> A6_EVENTS_INTERSECTIONS
A5_EVENTS >> A6_EVENTS_SEGMENTS
A6_EVENTS_INTERSECTIONS >> A7_EVENTS_CENTRELINE
A6_EVENTS_SEGMENTS >> A7_EVENTS_CENTRELINE
