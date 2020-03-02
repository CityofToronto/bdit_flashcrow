'''
This script generates SQL code that can be run to replicate layers from
ArcGIS REST servers to your own database.
'''
import csv
import datetime
import json
import sys
import time

from http_utils import requests_session

CSV_WRITER = csv.writer(sys.stdout)
ESRI_TYPES_INTEGER = [
  'esriFieldTypeInteger',
  'esriFieldTypeSingle',
  'esriFieldTypeOID',
  'esriFieldTypeSmallInteger',
  'esriFieldGlobalID'
]
ESRI_TYPES_LINE = [
  'esriGeometryLine',
  'esriGeometryPolyline'
]
ESRI_TYPES_POLYGON = [
  'esriGeometryMultiPolygon',
  'esriGeometryPolygon'
]
REQUESTS_SESSION = requests_session()

def get_json(url, params):
  """
  Attempt to fetch JSON for the given URL and query parameters.  Since ArcGIS occasionally
  returns empty HTTP 200 responses, we also retry on those empty responses.
  """
  empty_retries = 5
  sleep_time = 0.05
  while True:
    # Throttle our requests to reduce the chance of hitting rate limits, server capacity, etc.
    response = REQUESTS_SESSION.get(url, params=params)
    time.sleep(sleep_time)

    # If the response is empty, retry up to `empty_retries` times.
    if not response.text:
      empty_retries -= 1
      if empty_retries > 0:
        sleep_time *= 2
        continue
      msg = 'empty response from {url}'.format(
        url=response.url
      )
      raise ValueError(msg)

    # If the response can't be parsed as valid JSON, dump response body and exit.
    try:
      return response.json()
    except json.decoder.JSONDecodeError:
      msg = 'could not decode JSON for {url} (HTTP {status_code})'.format(
        url=response.url,
        status_code=response.status_code
      )
      print('--- JSON ERROR ---')
      print(msg)
      print('--- JSON BODY ---')
      print(response.text, flush=True)
      raise ValueError(msg)

def get_table_name(base_url, mapserver_name, layer_id):
  """
  Get table name from layer.
  """
  url = '{base_url}/{mapserver_name}/MapServer/layers'.format(
    base_url=base_url,
    mapserver_name=mapserver_name
  )
  params = {'f': 'json'}
  response = get_json(url, params)
  layers = response['layers']
  for layer in layers:
    if layer['id'] == layer_id:
      return layer['name'].lower().replace(' ', '_')
  msg = 'no layer with ID {layer_id} in mapserver {mapserver_name}'.format(
    layer_id=layer_id,
    mapserver_name=mapserver_name
  )
  raise ValueError(msg)

def get_column_type(field_type):
  """
  Map ESRI types to PostgreSQL equivalents.
  """
  if field_type in ESRI_TYPES_INTEGER:
    return 'integer'
  elif field_type == 'esriFieldTypeString':
    return 'text'
  elif field_type == 'esriFieldTypeDouble':
    return 'numeric'
  elif field_type == 'esriFieldTypeDate':
    return 'timestamp without time zone'
  msg = 'could not get PostgreSQL type for ESRI type {field_type}'.format(
    field_type=field_type
  )
  raise ValueError(msg)

def get_pg_geometry_type(geometry_type):
  """
  Output the given geometry of the given geometry type in WKT format.
  """
  if geometry_type in ESRI_TYPES_LINE:
    return 'geometry(LINESTRING, 4326)'
  elif geometry_type == 'esriGeometryPoint':
    return 'geometry(POINT, 4326)'
  elif geometry_type in ESRI_TYPES_POLYGON:
    return 'geometry(MULTIPOLYGON, 4326)'
  else:
    msg = 'invalid geometry type {geometry_type}'.format(geometry_type=geometry_type)
    raise ValueError(msg)

def dump_init_table(target_schema, target_validation_schema, table_name, response):
  """
  Prints `TRUNCATE` / `MATERIALIZED VIEW` commands for the given layer, as well as a `COPY`
  command to preface the dumped rows.
  """
  # schemas (required for tables / views)
  sql = 'CREATE SCHEMA IF NOT EXISTS "{target_schema}";'.format(
    target_schema=target_schema)
  print(sql)

  sql = 'CREATE SCHEMA IF NOT EXISTS "{target_validation_schema}";'.format(
    target_validation_schema=target_validation_schema)
  print(sql)

  new_columns = []
  fields = response['fields']
  for field in fields:
    field_name = field['name']
    column_name = field_name.lower().replace('.', '_')

    field_type = field['type']
    column_type = get_column_type(field_type)

    new_column = '"{column_name}" {column_type}'.format(
      column_name=column_name,
      column_type=column_type
    )
    new_columns.append(new_column)

  geometry_type = response['geometryType']
  pg_geometry_type = get_pg_geometry_type(geometry_type)
  new_column = 'geom {pg_geometry_type}'.format(
    pg_geometry_type=pg_geometry_type
  )
  new_columns.append(new_column)
  new_columns_clause = ',\n  '.join(new_columns)

  # validation table (replication jobs update data here)
  sql = '''\
CREATE TABLE IF NOT EXISTS "{target_validation_schema}"."{table_name}" (
  {new_columns_clause}
);
TRUNCATE TABLE "{target_validation_schema}"."{table_name}" RESTART IDENTITY;'''.format(
    target_validation_schema=target_validation_schema,
    table_name=table_name,
    new_columns_clause=new_columns_clause)
  print(sql)

  sql = 'COPY "{target_validation_schema}"."{table_name}" FROM stdin CSV;'.format(
    target_validation_schema=target_validation_schema,
    table_name=table_name)
  print(sql)

def get_data(
    base_url,
    mapserver_name,
    layer_id,
    page_offset,
    per_page):
  """
  Fetch data from the given layer, with the given page offset and size.
  """
  url = '{base_url}/{mapserver_name}/MapServer/{layer_id}/query'.format(
    base_url=base_url,
    mapserver_name=mapserver_name,
    layer_id=layer_id)
  params = {
    "where":"1=1",
    "outFields": "*",
    "outSR": '4326',
    "returnGeometry": "true",
    "returnTrueCurves": "false",
    "returnIdsOnly": "false",
    "returnCountOnly": "false",
    "returnZ": "false",
    "returnM": "false",
    "orderByFields": "OBJECTID",
    "returnDistinctValues": "false",
    "returnExtentsOnly": "false",
    "resultOffset": "{}".format(page_offset),
    "resultRecordCount": "{}".format(per_page),
    "f":"json"
  }
  return get_json(url, params)

def get_pg_timestamp(field_value):
  """
  Convert epoch milliseconds to PostgreSQL `timestamp without time zone` format.
  """
  field_datetime = datetime.datetime.fromtimestamp(field_value / 1000)
  return field_datetime.strftime('%Y-%m-%d %H:%M:%S')

def get_pg_value(feature, field):
  """
  Get the PostgreSQL value corresponding to the given field for the given feature.
  """
  field_name = field['name']
  field_value = feature['attributes'][field_name]
  if field_value is None:
    return ''
  field_type = field['type']
  if field_type == 'esriFieldTypeDate':
    return get_pg_timestamp(field_value)
  return str(field_value)

def get_pg_line(geometry):
  """
  Output the given line geometry in WKT format.
  """
  inner = ','.join(' '.join(str(x) for x in tup) for tup in geometry['paths'][0])
  return 'SRID=4326;LineString('+ inner + ')'

def get_pg_point(geometry):
  """
  Output the given point geometry in WKT format.
  """
  return 'SRID=4326;Point({x} {y})'.format(**geometry)

def get_pg_polygon(geometry):
  """
  Output the given polygon geometry in WKT format.
  """
  inner = ','.join(' '.join(str(x) for x in tup) for tup in geometry['rings'][0])
  return 'SRID=4326;MultiPolygon(((' + inner + ')))'

def get_pg_geometry(geometry_type, geometry):
  """
  Output the given geometry of the given geometry type in WKT format.
  """
  if geometry_type in ESRI_TYPES_LINE:
    return get_pg_line(geometry)
  elif geometry_type == 'esriGeometryPoint':
    return get_pg_point(geometry)
  elif geometry_type in ESRI_TYPES_POLYGON:
    return get_pg_polygon(geometry)
  else:
    msg = 'invalid geometry type {geometry_type}'.format(geometry_type=geometry_type)
    raise ValueError(msg)

def get_pg_row(feature, fields, geometry_type):
  """
  Output the row of PostgreSQL values for the given feature.  This row will include
  a field at the end for geometry, to match the extra geometry column generated in
  `dump_init_table`.
  """
  row = [get_pg_value(feature, field) for field in fields]
  geometry = feature['geometry']
  pg_geometry = get_pg_geometry(geometry_type, geometry)
  row.append(pg_geometry)
  return row

def dump_data(response):
  """
  Dump all features in the given REST API response to standard output.
  """
  features = response['features']
  fields = response['fields']
  geometry_type = response['geometryType']
  for feature in features:
    row = get_pg_row(feature, fields, geometry_type)
    CSV_WRITER.writerow(row)

def has_more_results(response):
  """
  Checks the `exceededTransferLimit` flag of the REST API response.  If set, this
  flag indicates that there are more rows after the page offset than could be
  returned in the response, which means that we need to continue paging.
  """
  return response.get('exceededTransferLimit', False)

def dump_finish_table(target_schema, target_validation_schema, table_name):
  """
  Finishes layer copy by creating and refreshing the materialized view.
  """
  # materialized view (applications access data here)
  sql = '''\
CREATE MATERIALIZED VIEW IF NOT EXISTS "{target_schema}"."{table_name}" AS
  SELECT * FROM "{target_validation_schema}"."{table_name}";'''.format(
    target_schema=target_schema,
    target_validation_schema=target_validation_schema,
    table_name=table_name)
  print(sql)

  # unique index (for REFRESH MATERIALIZED VIEW CONCURRENTLY)
  sql = '''\
CREATE UNIQUE INDEX IF NOT EXISTS "{table_name}_objectid"
ON "{target_schema}"."{table_name}" (objectid);'''.format(
    target_schema=target_schema,
    table_name=table_name)
  print(sql)

  # WGS84 (for lat/long lookups)
  sql = '''\
CREATE INDEX IF NOT EXISTS "{table_name}_geom"
ON "{target_schema}"."{table_name}"
USING GIST (geom);'''.format(
    target_schema=target_schema,
    table_name=table_name)
  print(sql)

  # Web Mercator (for vector tile generation)
  sql = '''\
CREATE INDEX IF NOT EXISTS "{table_name}_srid3857_geom"
ON "{target_schema}"."{table_name}"
USING GIST (ST_Transform(geom, 3857));'''.format(
    target_schema=target_schema,
    table_name=table_name)
  print(sql)

  # NAD83 / MTM zone 10 (for distance calculations in metres)
  sql = '''\
CREATE INDEX IF NOT EXISTS "{table_name}_srid2952_geom"
ON "{target_schema}"."{table_name}"
USING GIST (ST_Transform(geom, 2952));'''.format(
    target_schema=target_schema,
    table_name=table_name)
  print(sql)

  # validation table (replication jobs update data here)
  sql = 'REFRESH MATERIALIZED VIEW CONCURRENTLY "{target_schema}"."{table_name}";'.format(
    target_schema=target_schema,
    table_name=table_name)
  print(sql)

def get_layer(
    base_url,
    mapserver_name,
    layer_id,
    target_schema='gis',
    target_validation_schema='gis_new',
    per_page=500):
  """
  This function fetches layer metadata and records from the given ArcGIS server.  It then creates
  a table based on layer attribute types before inserting records into that table.

  ArcGIS Server returns records in a paginated format, so we must use `has_more_results` to check
  when we've paged through all results.

  Parameters
  ----------
  base_url : str
    URL to root of ArcGIS server

  mapserver_name : str
    Name of mapserver that hosts desired layer

  layer_id : int
    ID of desired layer

  target_schema : str
    PostgreSQL schema to create tables in

  per_page : int
    Number of records requested in a single REST API call
  """
  table_name = get_table_name(base_url, mapserver_name, layer_id)

  has_inited_table = False
  page_offset = 0
  while True:
    response = get_data(
      base_url,
      mapserver_name,
      layer_id,
      page_offset,
      per_page
    )
    if not has_inited_table:
      dump_init_table(target_schema, target_validation_schema, table_name, response)
      has_inited_table = True
    dump_data(response)
    if has_more_results(response):
      features = response['features']
      page_offset += len(features)
    else:
      break

  # Signal that the data dump is complete.
  print('\\.')

  # Finish off by refreshing the materialized view.
  dump_finish_table(target_schema, target_validation_schema, table_name)

if __name__ == '__main__':
  def main():
    """
    Test `get_layer` using the given base URL, mapserver name, and layer ID.
    """
    base_url = sys.argv[1]
    mapserver_name = sys.argv[2]
    layer_id = int(sys.argv[3])
    get_layer(base_url, mapserver_name, layer_id)

  main()
