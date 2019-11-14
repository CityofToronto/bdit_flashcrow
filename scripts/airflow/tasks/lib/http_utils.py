"""
HTTP utilities for MOVE Airflow jobs.
"""
from urllib3.util import Retry

import requests
from requests.adapters import HTTPAdapter

def requests_session(
    retries=3,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
    session=None):
  """
  Create a new `requests` session that automatically retries requests the
  specified number of times.
  """
  session = session or requests.Session()
  retry = Retry(
    total=retries,
    read=retries,
    connect=retries,
    backoff_factor=backoff_factor,
    status_forcelist=status_forcelist
  )
  adapter = HTTPAdapter(max_retries=retry)
  session.mount('http://', adapter)
  session.mount('https://', adapter)
  return session
