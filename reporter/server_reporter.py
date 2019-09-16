"""
server_reporter.py

MOVE Reporter is our reporting data and file generation engine.  It takes raw data from the
MOVE database, processes it according to report-specific logic, and offers output in a variety
of formats:

- JSON: often used by the MOVE web frontend to render web reports;
- CSV: raw data export, for use in various data analysis, database, and spreadsheet programs
designed to work with tabular data;
- Excel: workbook format, for ease of use by users familiar with Excel;
- PDF: viewable and printable reports, for sharing and presentation.

In both local and EC2 environments, MOVE Reporter is mapped to `/reporter`.
"""
import csv
import random

from flask import Flask, jsonify, request, Request, Response
from flask.logging import create_logger

APP = Flask(__name__)
LOG = create_logger(APP)

HTTP_BAD_REQUEST = 400
HTTP_NOT_FOUND = 404

CSV_ROW_LIMIT = 1000
CSV_COUNT_LIMIT = 10000

class HttpError(Exception):
  """
  Base class for HTTP errors.
  """
  def __init__(self, status_code, message, payload=None):
    Exception.__init__(self)
    self.status_code = status_code
    self.message = message
    self.payload = payload

  def to_dict(self):
    """
    Convert to `jsonify`-able `dict`.
    """
    body = dict(self.payload or ())
    body['message'] = self.message
    return body

class HttpBadRequest(HttpError):
  """
  HTTP 400: Bad Request
  """
  def __init__(self, message, payload=None):
    HttpError.__init__(self, HTTP_BAD_REQUEST, message, payload)

class HttpNotFound(HttpError):
  """
  HTTP 404: Not Found
  """
  def __init__(self, path):
    payload = {'path': path}
    HttpError.__init__(self, HTTP_NOT_FOUND, 'Not Found', payload)

def on_json_loading_failed(self, err):
  """
  Override default `on_json_loading_failed()` to use our `HttpError` hierarchy
  instead.
  """
  LOG.error(err)
  raise HttpBadRequest('failed to decode JSON object')
Request.on_json_loading_failed = on_json_loading_failed

@APP.errorhandler(HttpError)
def handle_http_error(error):
  """
  Error handler.  Returns error in JSON format.
  """
  error_body = error.to_dict()
  body = {'error': error_body}
  response = jsonify(body)
  response.status_code = error.status_code
  return response

@APP.route('/foo/<id>', methods=['GET', 'POST'])
# pylint: disable=invalid-name,redefined-builtin
def sample_route(id):
  """
  Test endpoint that echoes GET query params or POST request body, as per #169.
  """
  method = request.method
  response = {
    'id': id,
    'method': method
  }
  if method == 'GET':
    response.update(request.args)
  elif method == 'POST':
    body = request.get_json()
    if body is None:
      raise HttpBadRequest('Invalid POST body: expected application/json')
    response.update(body)
  return response

@APP.route('/csv-streaming/<int:n>', methods=['GET'])
def csv_streaming(n):
  """
  Test endpoint that streams out CSV data, as per #169.

  In this endpoint, we attempt to do this with `flask.Response` support for
  streaming generators.

  See https://flask.palletsprojects.com/en/1.1.x/patterns/streaming/ for examples.
  """
  if n <= 0:
    raise HttpBadRequest('Invalid number of rows: {n}'.format(n=n))
  if n > CSV_ROW_LIMIT:
    raise HttpBadRequest('Too many rows: {n}'.format(n=n))

  def generate():
    yield 'row,count\n'
    for i in range(n):
      count = random.randrange(CSV_COUNT_LIMIT)
      yield '{i},{count}\n'.format(i=i, count=count)

  return Response(
    generate(),
    mimetype='text/csv'
  )

class LineBuffer:
  """
  Dummy file-like object to hold one line at a time from `csv`.

  See https://stackoverflow.com/questions/32608265/streaming-a-generated-csv-with-flask
  """
  def __init__(self):
    self._line = None

  def write(self, line):
    """
    "Write" the line to our internal buffer.
    """
    self._line = line

  def read(self):
    """
    "Read" the line from our internal buffer.
    """
    return self._line


@APP.route('/csv-streaming-file/<int:n>', methods=['GET'])
def csv_streaming_file(n):
  """
  Test endpoint that streams out CSV data, as per #169.

  In this endpoint, we attempt to do this with the built-in `csv` module, which
  expects to work with file-like objects.
  """
  if n <= 0:
    raise HttpBadRequest('Invalid number of rows: {n}'.format(n=n))
  if n > CSV_ROW_LIMIT:
    raise HttpBadRequest('Too many rows: {n}'.format(n=n))

  def generate():
    line_buffer = LineBuffer()
    writer = csv.DictWriter(line_buffer, fieldnames=['row', 'count'])
    writer.writeheader()
    yield line_buffer.read()
    for i in range(n):
      count = random.randrange(CSV_COUNT_LIMIT)
      row = {'row': i, 'count': count}
      writer.writerow(row)
      yield line_buffer.read()

  return Response(
    generate(),
    mimetype='text/csv'
  )

@APP.route('/<path>')
def fallback(path):
  """
  Fallback route.  This allows us to use our `HttpError` hierarchy above.
  """
  LOG.warning('HTTP 404: %s', path)
  raise HttpNotFound(request.path)
