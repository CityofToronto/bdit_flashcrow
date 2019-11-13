'''
This script generates SQL code that can be run to replicate layers from
ArcGIS REST servers to your own database.
'''
import datetime
import time

import requests

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
ESRI_TYPES_POINT = [

]
ESRI_TYPES_POLYGON = [
  'esriGeometryMultiPolygon',
  'esriGeometryPolygon'
]

def get_table_name(base_url, mapserver_name, layer_id):
  """
  Function to retrieve the name of the layer

  Parameters
  -----------
  mapserver
      The mapserver that host the layer
  id
      The id of the layer

  Returns
  --------
  output_name
      The table name of the layer
  """
  url = '{base_url}/{mapserver_name}/MapServer/layers'.format(
    base_url=base_url,
    mapserver_name=mapserver_name
  )
  params = {'f': 'json'}
  response = requests.get(url, params=params)
  response = response.json()
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

def dump_init_table(target_schema, table_name, response):
  '''Create a new table in postgresql for the layer'''
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

  new_columns.append('geom geometry')
  new_columns_clause = '(\n  {0})'.format(',\n  '.join(new_columns))
  sql = 'CREATE TABLE IF NOT EXISTS "{target_schema}"."{table_name}" {new_columns_clause};'.format(
    target_schema=target_schema,
    table_name=table_name,
    new_columns_clause=new_columns_clause
  )
  print(sql)

  sql = 'COPY "{target_schema}"."{table_name}" FROM stdin;'.format(
    target_schema=target_schema,
    table_name=table_name
  )
  print(sql)

def get_data(
    base_url,
    mapserver_name,
    layer_id,
    page_offset,
    per_page):
  '''Get data from gcc view rest api'''
  url = '{base_url}/{mapserver_name}/MapServer/{layer_id}/query'.format(
    base_url=base_url,
    mapserver_name=mapserver_name,
    layer_id=layer_id
  )
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
  while True:
    try:
      response = requests.get(url, params=params)
      return response.json()
    except requests.exceptions.ConnectionError:
      time.sleep(10)

def get_pg_timestamp(field_value):
  '''Convert epoch time to postgresql timestamp without time zone'''
  field_datetime = datetime.datetime.fromtimestamp(field_value / 1000)
  return field_datetime.strftime('%Y-%m-%d %H:%M:%S')

def get_pg_value(feature, field):
  field_name = field['name']
  field_value = feature['attributes'][field_name]
  if field_value is None:
    return '\\N'
  field_type = field['type']
  if field_type == 'esriFieldTypeDate':
    return get_pg_timestamp(field_value)
  return str(field_value)

# Geometry Switcher
def get_pg_line(geometry):
  inner = ','.join(' '.join(str(x) for x in tup) for tup in geometry['paths'][0])
  return 'SRID=4326;LineString('+ inner + ')'

def get_pg_point(geometry):
  return 'SRID=4326;Point({x} {y})'.format(**geometry)

def get_pg_polygon(geometry):
  inner = ','.join(' '.join(str(x) for x in tup) for tup in geometry['rings'][0])
  return 'SRID=4326;MultiPolygon(((' + inner + ')))'

def get_pg_geometry(geometry_type, geometry):
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
  row = [get_pg_value(feature, field) for field in fields]
  geometry = feature['geometry']
  pg_geometry = get_pg_geometry(geometry_type, geometry)
  row.append(pg_geometry)
  return row

def dump_data(response):
  '''Send data to postgresql'''
  features = response['features']
  fields = response['fields']
  geometry_type = response['geometryType']
  for feature in features:
    row = get_pg_row(feature, fields, geometry_type)
    print('\t'.join(row))

def has_more_results(response):
  '''Check if last query return all rows'''
  return response.get('exceededTransferLimit', False)

def get_layer(
    base_url,
    mapserver_name,
    layer_id,
    target_schema='gis',
    per_page=100):
  """
  This function fetches layer metadata and records from the given ArcGIS server.  It then creates
  a table based on layer attribute types before inserting records into that table.

  ArcGIS Server returns records in a paginated format.

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
      dump_init_table(target_schema, table_name, response)
      has_inited_table = True
    dump_data(response)
    if has_more_results(response):
      features = response['features']
      page_offset += len(features)
    else:
      break
  print('\\.')

if __name__ == '__main__':
  def main():
    import sys
    base_url = sys.argv[1]
    mapserver_name = sys.argv[2]
    layer_id = int(sys.argv[3])
    get_layer(base_url, mapserver_name, layer_id)

  main()
