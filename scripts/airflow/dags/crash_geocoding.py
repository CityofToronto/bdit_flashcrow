"""
crash_geocoding

Normalize CRASH data into collision "events" and collision "involved persons", then match
collision events to a centreline street segment or intersection.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 7, 17)
SCHEDULE_INTERVAL = '10 6-22 * * 1-5'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

CRASH_NORM = create_bash_task(DAG, 'crash_norm')
BUILD_EVENTS_INTERSECTIONS = create_bash_task(DAG, 'build_events_intersections')
BUILD_EVENTS_SEGMENTS = create_bash_task(DAG, 'build_events_segments')
BUILD_EVENTS_CENTRELINE = create_bash_task(DAG, 'build_events_centreline')
CRASH_CUTOVER = create_bash_task(DAG, 'crash_cutover')

CRASH_NORM >> BUILD_EVENTS_INTERSECTIONS
CRASH_NORM >> BUILD_EVENTS_SEGMENTS
BUILD_EVENTS_INTERSECTIONS >> BUILD_EVENTS_CENTRELINE
BUILD_EVENTS_SEGMENTS >> BUILD_EVENTS_CENTRELINE
BUILD_EVENTS_CENTRELINE >> CRASH_CUTOVER
