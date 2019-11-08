#!/bin/bash

. /home/ec2-user/cot-env.config
echo "postgresql+psycopg2://airflow@${PGHOST}/airflow"
