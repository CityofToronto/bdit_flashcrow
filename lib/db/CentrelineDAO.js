const db = require('./db');

// TODO: DRY with server.js
const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

// TODO: DRY with store.js
function centrelineKey(centrelineType, centrelineId) {
  return `${centrelineType}/${centrelineId}`;
}

class CentrelineDAO {
  static async segmentsByIds(centrelineIds) {
    if (centrelineIds.length === 0) {
      return [];
    }
    const sql = `
SELECT
  CAST(geo_id AS INT), lf_name, ST_AsGeoJSON(ST_ClosestPoint(geom, ST_Centroid(geom)))::json AS geom
  FROM gis.centreline
  WHERE geo_id IN ($(centrelineIds:csv))`;
    const rows = await db.manyOrNone(sql, { centrelineIds });
    return rows.map(({
      lf_name: description,
      geo_id: centrelineId,
      geom,
    }) => {
      const [lng, lat] = geom.coordinates;
      return {
        centrelineId,
        centrelineType: CentrelineType.SEGMENT,
        description,
        lat,
        lng,
      };
    });
  }

  static async intersectionsByIds(centrelineIds) {
    // TODO: how do users select overpasses on the map?
    if (centrelineIds.length === 0) {
      return [];
    }
    const sql = `SELECT * FROM (
  SELECT
    ROW_NUMBER() OVER (PARTITION BY int_id ORDER BY elev_level ASC) __row,
    int_id, intersec5, ST_AsGeoJSON(geom)::json AS geom
    FROM gis.centreline_intersection
    WHERE int_id IN ($(centrelineIds:csv))
  ) x WHERE x.__row = 1`;
    const rows = await db.manyOrNone(sql, { centrelineIds });
    return rows.map(({
      geom,
      intersec5: description,
      int_id: centrelineId,
    }) => {
      const [lng, lat] = geom.coordinates;
      return {
        centrelineId,
        centrelineType: CentrelineType.INTERSECTION,
        description,
        lat,
        lng,
      };
    });
  }

  static async byIdAndType(centrelineId, centrelineType) {
    const centrelineIdsAndTypes = [{ centrelineId, centrelineType }];
    const features = await CentrelineDAO.byIdsAndTypes(centrelineIdsAndTypes);
    const featuresOfType = features.get(centrelineType);
    if (featuresOfType.has(centrelineId)) {
      return featuresOfType.get(centrelineId);
    }
    return null;
  }

  static async byIdsAndTypes(centrelineIdsAndTypes) {
    const segmentIds = new Set();
    const intersectionIds = new Set();
    centrelineIdsAndTypes.forEach(({ centrelineId, centrelineType }) => {
      // TODO: use Constants.CentrelineType
      if (centrelineType === CentrelineType.SEGMENT) {
        segmentIds.add(centrelineId);
      } else if (centrelineType === CentrelineType.INTERSECTION) {
        intersectionIds.add(centrelineId);
      }
    });
    const [rowsSegments, rowsIntersections] = await Promise.all([
      CentrelineDAO.segmentsByIds([...segmentIds]),
      CentrelineDAO.intersectionsByIds([...intersectionIds]),
    ]);
    const features = new Map();
    rowsSegments.forEach((segment) => {
      const { centrelineId } = segment;
      const key = centrelineKey(CentrelineType.SEGMENT, centrelineId);
      features.set(key, segment);
    });
    rowsIntersections.forEach((intersection) => {
      const { centrelineId } = intersection;
      const key = centrelineKey(CentrelineType.INTERSECTION, centrelineId);
      features.set(key, intersection);
    });
    return features;
  }
}

module.exports = CentrelineDAO;
