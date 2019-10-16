import db from '@/lib/db/db';
import {
  centrelineKey,
  CentrelineType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

function segmentToFeature({
  lf_name: description,
  fcode: featureCode,
  geo_id: centrelineId,
  geom,
  geomPoint,
  lfn_id: roadId,
}) {
  const [lng, lat] = geomPoint.coordinates;
  return {
    centrelineId,
    centrelineType: CentrelineType.SEGMENT,
    description,
    featureCode,
    geom,
    lat,
    lng,
    roadId,
  };
}

function intersectionToFeature({
  geom,
  intersec5: description,
  elevatio9: featureCode,
  int_id: centrelineId,
}) {
  const [lng, lat] = geom.coordinates;
  return {
    centrelineId,
    centrelineType: CentrelineType.INTERSECTION,
    description,
    featureCode,
    geom,
    lat,
    lng,
    /*
     * Only SEGMENT features have road IDs.  When using `roadId`, you should usually
     * check `feature.centrelineType === CentrelineType.SEGMENT` first.
     */
    roadId: null,
  };
}

/**
 * Data access layer for centreline "features", which include both segments and
 * intersections under a common interface.
 */
class CentrelineDAO {
  // SEGMENTS
  static async segmentsByIds(centrelineIds) {
    if (centrelineIds.length === 0) {
      return [];
    }
    const sql = `
SELECT
  CAST(geo_id AS INT),
  lfn_id,
  lf_name,
  fcode,
  ST_AsGeoJSON(ST_ClosestPoint(geom, ST_Centroid(geom)))::json AS "geomPoint",
  ST_AsGeoJSON(ST_LineMerge(geom))::json AS geom
  FROM gis.centreline
  WHERE geo_id IN ($(centrelineIds:csv))`;
    const rows = await db.manyOrNone(sql, { centrelineIds });
    return rows.map(segmentToFeature);
  }

  static async segmentsIncidentTo(intersectionId) {
    const sql = `
SELECT
  CAST(geo_id AS INT),
  lfn_id,
  lf_name,
  fcode,
  ST_AsGeoJSON(ST_ClosestPoint(geom, ST_Centroid(geom)))::json AS "geomPoint",
  ST_AsGeoJSON(ST_lineMerge(geom))::json AS geom
  FROM gis.centreline
  WHERE fnode = $(intersectionId) OR tnode = $(intersectionId)`;
    const rows = await db.manyOrNone(sql, { intersectionId });
    return rows.map(segmentToFeature);
  }

  // INTERSECTIONS

  static async intersectionsByIds(centrelineIds) {
    // TODO: how do users select overpasses on the map?
    if (centrelineIds.length === 0) {
      return [];
    }
    const sql = `
SELECT DISTINCT ON (int_id)
  int_id,
  intersec5,
  elevatio9,
  ST_AsGeoJSON(geom)::json AS geom
  FROM gis.centreline_intersection
  WHERE int_id IN ($(centrelineIds:csv))
  ORDER BY int_id ASC, elev_level ASC`;
    const rows = await db.manyOrNone(sql, { centrelineIds });
    return rows.map(intersectionToFeature);
  }

  static async intersectionsIncidentTo(segmentId) {
    const sql = `
SELECT DISTINCT ON (int_id)
  gci.int_id,
  gci.intersec5,
  gci.elevatio9,
  ST_AsGeoJSON(gci.geom)::json AS geom
  FROM gis.centreline_intersection gci
  JOIN gis.centreline gc ON gci.int_id IN (gc.fnode, gc.tnode)
  WHERE gc.geo_id = $(segmentId)
  ORDER BY int_id ASC, elev_level ASC`;
    const rows = await db.manyOrNone(sql, { segmentId });
    return rows.map(intersectionToFeature);
  }

  // COMBINED METHODS

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
   * @returns {Array} incident features
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
