import db from '@/lib/db/db';
import {
  centrelineKey,
  CentrelineType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';
import { segmentToFeature } from '@/lib/model/helpers/NormalizeUtils';

/**
 * Data access layer for centreline "features", which include both midblocks and
 * intersections under a common interface.
 */
class CentrelineDAO {
  // SEGMENTS

  /**
   *
   * @param {Array<number>} centrelineIds
   * @returns {Promise<Array<CentrelineLocation>>}
   */
  static async segmentsByIds(centrelineIds) {
    if (centrelineIds.length === 0) {
      return [];
    }
    const sql = `
SELECT
  aadt,
  "centrelineId",
  "centrelineType",
  "featureCode",
  "fromIntersectionName",
  ST_AsGeoJSON(geom)::json AS geom,
  lat,
  lng,
  "midblockName",
  "roadId",
  "toIntersectionName"
FROM centreline.midblocks
WHERE "centrelineId" IN ($(centrelineIds:csv))`;
    const rows = await db.manyOrNone(sql, { centrelineIds });
    return rows.map(segmentToFeature);
  }

  /**
   *
   * @param {number} intersectionId
   * @returns {Promise<Array<CentrelineLocation>>}
   */
  static async segmentsIncidentTo(intersectionId) {
    const sql = `
SELECT
  aadt,
  "centrelineId",
  "centrelineType",
  "featureCode",
  "fromIntersectionName",
  ST_AsGeoJSON(geom)::json AS geom,
  lat,
  lng,
  "midblockName",
  "roadId",
  "toIntersectionName"
FROM centreline.midblocks
WHERE fnode = $(intersectionId) OR tnode = $(intersectionId)`;
    const rows = await db.manyOrNone(sql, { intersectionId });
    return rows.map(segmentToFeature);
  }

  // INTERSECTIONS

  /**
   *
   * @param {Array<number>} centrelineIds
   * @returns {Promise<Array<CentrelineLocation>>}
   */
  static async intersectionsByIds(centrelineIds) {
    // TODO: how do users select overpasses on the map?
    if (centrelineIds.length === 0) {
      return [];
    }
    const sql = `
SELECT
  "centrelineId",
  "centrelineType",
  classification,
  description,
  "featureCode",
  ST_AsGeoJSON(geom)::json AS geom,
  lat,
  lng
FROM centreline.intersections
WHERE "centrelineId" IN ($(centrelineIds:csv))`;
    return db.manyOrNone(sql, { centrelineIds });
  }

  /**
   *
   * @param {number} segmentId
   * @returns {Promise<Array<CentrelineLocation>>}
   */
  static async intersectionsIncidentTo(segmentId) {
    const sql = `
SELECT
  ci."centrelineId",
  ci."centrelineType",
  ci.classification,
  ci.description,
  ci."featureCode",
  ST_AsGeoJSON(ci.geom)::json AS geom,
  ci.lat,
  ci.lng
FROM centreline.intersections ci
JOIN centreline.midblocks cm ON ci."centrelineId" IN (cm.fnode, cm.tnode)
WHERE cm."centrelineId" = $(segmentId)`;
    return db.manyOrNone(sql, { segmentId });
  }

  // COMBINED METHODS

  /**
   *
   * @param {CentrelineFeature} feature
   * @returns {Promise<CentrelineLocation?>}
   */
  static async byFeature(feature) {
    const locations = await CentrelineDAO.byFeatures([feature]);
    const [location] = locations;
    return location;
  }

  /**
   *
   * @param {Array<CentrelineFeature>} features
   * @returns {Promise<Array<CentrelineLocation?>>}
   */
  static async byFeatures(features) {
    const segmentIds = new Set();
    const intersectionIds = new Set();
    features.forEach(({ centrelineId, centrelineType }) => {
      if (centrelineType === CentrelineType.SEGMENT) {
        segmentIds.add(centrelineId);
      } else if (centrelineType === CentrelineType.INTERSECTION) {
        intersectionIds.add(centrelineId);
      } else {
        throw new InvalidCentrelineTypeError(centrelineType);
      }
    });
    const [rowsSegments, rowsIntersections] = await Promise.all([
      CentrelineDAO.segmentsByIds([...segmentIds]),
      CentrelineDAO.intersectionsByIds([...intersectionIds]),
    ]);
    const locationMap = new Map();
    rowsSegments.forEach((segment) => {
      const { centrelineId } = segment;
      const feature = { centrelineId, centrelineType: CentrelineType.SEGMENT };
      const key = centrelineKey(feature);
      locationMap.set(key, segment);
    });
    rowsIntersections.forEach((intersection) => {
      const { centrelineId } = intersection;
      const feature = { centrelineId, centrelineType: CentrelineType.INTERSECTION };
      const key = centrelineKey(feature);
      locationMap.set(key, intersection);
    });
    return features.map((feature) => {
      const key = centrelineKey(feature);
      const location = locationMap.get(key);
      if (location === undefined) {
        return null;
      }
      return location;
    });
  }

  /**
   * Returns the centreline features that are incident to the given feature.
   * For intersections, these are the intersection legs.  For segments, these
   * are the segment endpoints.
   *
   * Note that this is *NOT* the same as *adjacent* (vertices connected by an
   * edge).  To understand the difference: suppose `u`, `v` are two vertices
   * connected by an edge `e`.  Then `e` is incident to `u`, `v` but `u`, `v`
   * themselves are adjacent.
   *
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {number} centrelineId - ID of centreline feature
   * @returns {Promise<Array<CentrelineLocation>>} incident features
   */
  static async featuresIncidentTo(centrelineType, centrelineId) {
    if (centrelineType === CentrelineType.SEGMENT) {
      return CentrelineDAO.intersectionsIncidentTo(centrelineId);
    }
    if (centrelineType === CentrelineType.INTERSECTION) {
      return CentrelineDAO.segmentsIncidentTo(centrelineId);
    }
    throw new InvalidCentrelineTypeError(centrelineType);
  }
}

export default CentrelineDAO;
