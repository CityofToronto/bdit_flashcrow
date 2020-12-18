import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

function getCentrelineTable(centrelineType) {
  if (centrelineType === CentrelineType.SEGMENT) {
    return 'centreline.midblocks';
  }
  if (centrelineType === CentrelineType.INTERSECTION) {
    return 'centreline.intersections';
  }
  throw new InvalidCentrelineTypeError(centrelineType);
}

class PoiDAO {
  static async byCentrelineAndType(type, centrelineId, centrelineType, radius) {
    const centrelineTable = getCentrelineTable(centrelineType);
    const poiTable = `gis.${type}`;
    const sql = `SELECT poi.objectid AS id, ST_Distance(
      ST_Transform(poi.geom, 2952),
      ST_Transform(c.geom, 2952)
    ) AS geom_dist
    FROM ${centrelineTable} c, ${poiTable} poi
    WHERE
      c."centrelineId" = $(centrelineId)
      AND ST_DWithin(
        ST_Transform(poi.geom, 2952),
        ST_Transform(c.geom, 2952),
        $(radius)
      )
    ORDER BY geom_dist ASC
    LIMIT 1`;
    return db.oneOrNone(sql, { centrelineId, radius });
  }

  static async byCentrelineSummary(centrelineId, centrelineType, radius) {
    const tasks = [
      PoiDAO.byCentrelineAndType('hospital', centrelineId, centrelineType, radius),
      PoiDAO.byCentrelineAndType('school', centrelineId, centrelineType, radius),
    ];
    const [hospital, school] = await Promise.all(tasks);
    return { hospital, school };
  }
}

export default PoiDAO;
