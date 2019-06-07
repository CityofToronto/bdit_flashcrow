"""
airflow_admin_user.py
"""
import sys

import airflow
from airflow import models, settings
from airflow.contrib.auth.backends.password_auth import PasswordUser

def main():
  """
  Creates the new Airflow admin user.
  """
  user = PasswordUser(models.User())
  user.username = 'admin'
  user.email = 'airflow@flashcrow-etl.intra.dev-toronto.ca'
  user.password = sys.argv[1]
  session = settings.Session()
  session.add(user)
  session.commit()
  session.close()
