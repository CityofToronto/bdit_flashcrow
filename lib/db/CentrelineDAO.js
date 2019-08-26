import db from './db';
import {
  centrelineKey,
  CentrelineType,
} from '../../src/lib/Constants';

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
    const sql = `
SELECT DISTINCT ON (int_id)
  int_id, intersec5, ST_AsGeoJSON(geom)::json AS geom
  FROM gis.centreline_intersection
  WHERE int_id IN ($(centrelineIds:csv))
  ORDER BY int_id ASC, elev_level ASC`;
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
    const key = centrelineKey(centrelineType, centrelineId);
    if (features.has(key)) {
      return features.get(key);
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

export default CentrelineDAO;
