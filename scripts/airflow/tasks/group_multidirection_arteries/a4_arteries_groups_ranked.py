'''
This script generates SQL code to greedily pair up midblock arterycodes as
per the ranking function in `A4_arteries_groups_ranked.sql`.
'''
import csv
import sys

def get_pair_sql(a_1, a_2, geo_id):
  '''
  Build SQL statement to pair up the two given arterycodes on the given centreline ID
  in `arteries_groups`.
  '''
  return '''\
INSERT INTO counts_new.arteries_groups (
  arterycode, match_on_case, group_id, centreline_type, centreline_id
) VALUES
  ({a_1}, 4, {a_1}, 1, {geo_id}),
  ({a_2}, 4, {a_1}, 1, {geo_id});'''.format(a_1=a_1, a_2=a_2, geo_id=geo_id)

if __name__ == '__main__':
  def main():
    """
    Test `get_layer` using the given base URL, mapserver name, and layer ID.
    """
    reader = csv.DictReader(sys.stdin)
    paired = set()
    for row in reader:
      a_1 = int(row['a1'])
      a_2 = int(row['a2'])
      geo_id = int(row['geo_id'])
      if a_1 not in paired and a_2 not in paired:
        sql = get_pair_sql(a_1, a_2, geo_id)
        print(sql)
        paired.add(a_1)
        paired.add(a_2)

  main()
