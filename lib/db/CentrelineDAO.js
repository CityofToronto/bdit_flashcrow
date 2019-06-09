const db = require('./db');

// TODO: DRY with server.js
const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

class CentrelineDAO {
  static async segmentById(centrelineId) {
    const sql = `
SELECT
  lf_name, ST_AsGeoJSON(ST_ClosestPoint(geom, ST_Centroid(geom)))::json AS geom
  FROM gis.centreline
  WHERE geo_id=$(centrelineId)`;
    const row = await db.oneOrNone(sql, { centrelineId });
    if (row === null) {
      return null;
    }
    const { lf_name: description, geom } = row;
    const [lng, lat] = geom.coordinates;
    return {
      centrelineId,
      centrelineType: CentrelineType.SEGMENT,
      description,
      lat,
      lng,
    };
  }

  static async intersectionById(centrelineId) {
    // TODO: how do users select overpasses on the map?
    const sql = `
SELECT
  intersec5, ST_AsGeoJSON(geom)::json AS geom
  FROM gis.centreline_intersection
  WHERE int_id=$(centrelineId)
  ORDER BY elev_level ASC LIMIT 1`;
    const row = await db.oneOrNone(sql, { centrelineId });
    if (row === null) {
      return null;
    }
    const { intersec5: description, geom } = row;
    const [lng, lat] = geom.coordinates;
    return {
      centrelineId,
      centrelineType: CentrelineType.INTERSECTION,
      description,
      lat,
      lng,
    };
  }

  static async byIdAndType(centrelineId, centrelineType) {
    // TODO: use Constants.CentrelineType
    if (centrelineType === CentrelineType.SEGMENT) {
      return CentrelineDAO.segmentById(centrelineId);
    }
    if (centrelineType === CentrelineType.INTERSECTION) {
      return CentrelineDAO.intersectionById(centrelineId);
    }
    return null;
  }
}

module.exports = CentrelineDAO;
