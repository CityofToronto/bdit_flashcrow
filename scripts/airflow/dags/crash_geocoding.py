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
A2_INVOLVED_FIELDS_RAW = create_bash_task_nested(DAG, 'A2_involved_fields_raw')
A3_EVENTS_FIELDS_NORM = create_bash_task_nested(DAG, 'A3_events_fields_norm')
A3_INVOLVED = create_bash_task_nested(DAG, 'A3_involved')
A4_EVENTS = create_bash_task_nested(DAG, 'A4_events')
A5_EVENTS_INTERSECTIONS = create_bash_task_nested(DAG, 'A5_events_intersections')
A5_EVENTS_SEGMENTS = create_bash_task_nested(DAG, 'A5_events_segments')
A6_EVENTS_CENTRELINE = create_bash_task_nested(DAG, 'A6_events_centreline')

A1_EVENTS_FIELDS_RAW >> A2_INVOLVED_FIELDS_RAW
A2_INVOLVED_FIELDS_RAW >> A3_EVENTS_FIELDS_NORM
A2_INVOLVED_FIELDS_RAW >> A3_INVOLVED
A3_EVENTS_FIELDS_NORM >> A4_EVENTS
A3_INVOLVED >> A4_EVENTS
A4_EVENTS >> A5_EVENTS_INTERSECTIONS
A4_EVENTS >> A5_EVENTS_SEGMENTS
A5_EVENTS_INTERSECTIONS >> A6_EVENTS_CENTRELINE
A5_EVENTS_SEGMENTS >> A6_EVENTS_CENTRELINE
