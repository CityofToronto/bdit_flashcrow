import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

const SCHOOL_RADIUS = 250;

class PoiDAO {
  // SEGMENT
  static async bySegmentSchool(centrelineId) {
    const sql = `SELECT s.objectid AS id, ST_Distance(
      ST_Transform(s.geom, 26917),
      ST_Transform(c.geom, 26917)
    ) AS geom_dist
    FROM gis.centreline c, gis.school s
    WHERE
      c.geo_id = $(centrelineId)
      AND ST_DWithin(
        ST_Transform(s.geom, 26917),
        ST_Transform(c.geom, 26917),
        ${SCHOOL_RADIUS}
      )
    ORDER BY geom_dist ASC
    LIMIT 1`;
    return db.oneOrNone(sql, { centrelineId });
  }

  // INTERSECTION
  static async byIntersectionSchool(centrelineId) {
    const sql = `SELECT s.objectid AS id, ST_Distance(
      ST_Transform(s.geom, 26917),
      ST_Transform(ci.geom, 26917)
    ) AS geom_dist
    FROM gis.centreline_intersection ci, gis.school s
    WHERE
      ci.int_id = $(centrelineId)
      AND ST_DWithin(
        ST_Transform(s.geom, 26917),
        ST_Transform(ci.geom, 26917),
        ${SCHOOL_RADIUS}
      )
    ORDER BY geom_dist ASC
    LIMIT 1`;
    return db.oneOrNone(sql, { centrelineId });
  }

  // COMBINED
  static async byCentrelineSchool(centrelineId, centrelineType) {
    if (centrelineType === CentrelineType.SEGMENT) {
      return PoiDAO.bySegmentSchool(centrelineId);
    }
    if (centrelineType === CentrelineType.INTERSECTION) {
      return PoiDAO.byIntersectionSchool(centrelineId);
    }
    throw new InvalidCentrelineTypeError(centrelineType);
  }

  static async byCentrelineSummary(centrelineId, centrelineType) {
    const school = await PoiDAO.byCentrelineSchool(centrelineId, centrelineType);
    return { school };
  }
}

export default PoiDAO;
