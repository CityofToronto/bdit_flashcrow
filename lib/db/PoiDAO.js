import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

const POI_RADIUS = 500;

function getCentrelineTable(centrelineType) {
  if (centrelineType === CentrelineType.SEGMENT) {
    return 'gis.centreline';
  }
  if (centrelineType === CentrelineType.INTERSECTION) {
    return 'gis.centreline_intersection';
  }
  throw new InvalidCentrelineTypeError(centrelineType);
}

function getCentrelineIdColumn(centrelineType) {
  if (centrelineType === CentrelineType.SEGMENT) {
    return 'geo_id';
  }
  if (centrelineType === CentrelineType.INTERSECTION) {
    return 'int_id';
  }
  throw new InvalidCentrelineTypeError(centrelineType);
}

class PoiDAO {
  static async byCentrelineAndType(type, centrelineId, centrelineType) {
    const centrelineTable = getCentrelineTable(centrelineType);
    const centrelineIdColumn = getCentrelineIdColumn(centrelineType);
    const poiTable = `gis.${type}`;
    const sql = `SELECT poi.objectid AS id, ST_Distance(
      ST_Transform(poi.geom, 2952),
      ST_Transform(c.geom, 2952)
    ) AS geom_dist
    FROM ${centrelineTable} c, ${poiTable} poi
    WHERE
      c.${centrelineIdColumn} = $(centrelineId)
      AND ST_DWithin(
        ST_Transform(poi.geom, 2952),
        ST_Transform(c.geom, 2952),
        ${POI_RADIUS}
      )
    ORDER BY geom_dist ASC
    LIMIT 1`;
    return db.oneOrNone(sql, { centrelineId });
  }

  static async byCentrelineSummary(centrelineId, centrelineType) {
    const tasks = [
      PoiDAO.byCentrelineAndType('hospital', centrelineId, centrelineType),
      PoiDAO.byCentrelineAndType('school', centrelineId, centrelineType),
    ];
    const [hospital, school] = await Promise.all(tasks);
    return { hospital, school };
  }
}

export default PoiDAO;
