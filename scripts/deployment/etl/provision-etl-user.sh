#!/bin/bash
#
# provision-web-user.sh
#
# Sets up Airflow-specific user-level packages and directories.
#
# This script should *not* contain any calls to sudo.  If you have commands
# that must be run as root, add them to provision-web-admin.sh.

set -e
set -o nounset

cd "$(dirname "$0")"

mkdir -p "$HOME/airflow"
# shellcheck disable=SC2016
echo 'export AIRFLOW_HOME="$HOME/airflow"' >> "$HOME/.bashrc"
# shellcheck disable=SC1090
. "$HOME/.bashrc"

pip install --upgrade pip
pip install apache-airflow psycopg2 mbutil flask-bcrypt

# create log directories
echo "creating log directories..."
mkdir -p "$HOME/log/airflow"

# initdb, first time (to generate directory)
airflow initdb

# .pgpass entries: airflow, BDITTO
# copy airflow.cfg over
# run airflow_admin_user.py
# install tippecanoe
git clone https://github.com/mapbox/tippecanoe.git "$HOME/tippecanoe"
cd "$HOME/tippecanoe"
make -j
sudo make install


ln -s /home/ec2-user/flashcrow/scripts/airflow/dags /home/ec2-user/airflow/dags

# copy over systemd files
sudo cp /home/ec2-user/flashcrow/scripts/airflow/systemd/airflow /etc/sysconfig/airflow
sudo cp /home/ec2-user/flashcrow/scripts/airflow/systemd/airflow-scheduler.service /usr/lib/systemd/system
sudo cp /home/ec2-user/flashcrow/scripts/airflow/systemd/airflow-webserver.service /usr/lib/systemd/system
sudo cp /home/ec2-user/flashcrow/scripts/airflow/systemd/airflow.conf /usr/lib/tmpfiles.d
sudo systemctl start airflow-webserver
sudo systemctl start airflow-scheduler
