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
pip install apache-airflow psycopg2 mbutil flask-bcrypt cryptography

# generate secure random user password using `openssl`, and write to `.pgpass`
echo "Generating PostgreSQL user password..."
AIRFLOW_USER_PASSWORD=$(openssl rand -base64 32)
echo "${PGHOST}:5432:airflow:airflow:${AIRFLOW_USER_PASSWORD}" >> "$HOME/.pgpass"

# create database
psql -h "${PGHOST}" -U flashcrow_dba postgres -v pgPassword="'$AIRFLOW_USER_PASSWORD'" < ./provision-db-airflow.sql

# initdb, first time (to generate directory)
airflow initdb

AIRFLOW_ADMIN_PASSWORD=$(openssl rand -base64 32)
python ./airflow_admin_user.py "${AIRFLOW_ADMIN_PASSWORD}"

# copy airflow.cfg over
cp /home/ec2-user/flashcrow/scripts/deployment/etl/airflow.cfg /home/ec2-user/airflow/airflow.cfg

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
