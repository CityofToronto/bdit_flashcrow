"""
airflow_log_cleanup

A maintenance workflow that you can deploy into Airflow to periodically clean out the task logs
to avoid those getting too big.
"""
# pylint: disable=pointless-statement,anomalous-backslash-in-string
from datetime import datetime

from airflow.configuration import conf
from airflow.operators.bash_operator import BashOperator

from airflow_utils import create_dag

START_DATE = datetime(2019, 10, 21)
SCHEDULE_INTERVAL = '@daily'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

BASE_LOG_FOLDER = conf.get("core", "BASE_LOG_FOLDER")
MAX_LOG_AGE_IN_DAYS = 30    # Number of days to retain the log files
ENABLE_DELETE = True

DIRECTORIES_TO_DELETE = [BASE_LOG_FOLDER]

LOG_CLEANUP = """
echo "Getting Configurations..."
BASE_LOG_FOLDER="{{params.directory}}"
TYPE="{{params.type}}"
MAX_LOG_AGE_IN_DAYS='""" + str(MAX_LOG_AGE_IN_DAYS) + """'
ENABLE_DELETE=""" + str("true" if ENABLE_DELETE else "false") + """
echo "Finished Getting Configurations"
echo ""

echo "Configurations:"
echo "BASE_LOG_FOLDER:      '${BASE_LOG_FOLDER}'"
echo "MAX_LOG_AGE_IN_DAYS:  '${MAX_LOG_AGE_IN_DAYS}'"
echo "ENABLE_DELETE:        '${ENABLE_DELETE}'"
echo "TYPE:                 '${TYPE}'"

echo ""
echo "Running Cleanup Process..."
if [ $TYPE == file ];
then
    FIND_STATEMENT="find ${BASE_LOG_FOLDER}/*/* -type f -mtime +${MAX_LOG_AGE_IN_DAYS}"
    DELETE_STMT="${FIND_STATEMENT} -exec rm -f {} \;"
else
    FIND_STATEMENT="find ${BASE_LOG_FOLDER}/*/* -type d -empty"
    DELETE_STMT="${FIND_STATEMENT} -prune -exec rm -rf {} \;"
fi
echo "Executing Find Statement: ${FIND_STATEMENT}"
FILES_MARKED_FOR_DELETE=`eval ${FIND_STATEMENT}`
echo "Process will be Deleting the following File(s)/Directory(s):"
echo "${FILES_MARKED_FOR_DELETE}"
echo "Process will be Deleting `echo "${FILES_MARKED_FOR_DELETE}" | grep -v '^$' | wc -l` File(s)/Directory(s)"     # "grep -v '^$'" - removes empty lines. "wc -l" - Counts the number of lines
echo ""
if [ "${ENABLE_DELETE}" == "true" ];
then
    if [ "${FILES_MARKED_FOR_DELETE}" != "" ];
    then
        echo "Executing Delete Statement: ${DELETE_STMT}"
        eval ${DELETE_STMT}
        DELETE_STMT_EXIT_CODE=$?
        if [ "${DELETE_STMT_EXIT_CODE}" != "0" ]; then
            echo "Delete process failed with exit code '${DELETE_STMT_EXIT_CODE}'"
            exit ${DELETE_STMT_EXIT_CODE}
        fi
    else
        echo "WARN: No File(s)/Directory(s) to Delete"
    fi
else
    echo "WARN: You're opted to skip deleting the File(s)/Directory(s)!!!"
fi
echo "Finished Running Cleanup Process"
"""
for i, directory in enumerate(DIRECTORIES_TO_DELETE):
  log_cleanup_file_op = BashOperator(
    task_id='log_cleanup_file_' + str(i),
    bash_command=LOG_CLEANUP,
    params={"directory": str(directory), "type": "file"},
    dag=DAG
  )

  log_cleanup_dir_op = BashOperator(
    task_id='log_cleanup_directory_' + str(i),
    bash_command=LOG_CLEANUP,
    params={"directory": str(directory), "type": "directory"},
    dag=DAG
  )

  log_cleanup_file_op >> log_cleanup_dir_op
