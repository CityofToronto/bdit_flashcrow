import db from '@/lib/db/db';
import {
  centrelineKey,
  CentrelineType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';
import {
  intersectionToFeature,
  segmentToFeature,
} from '@/lib/model/helpers/NormalizeUtils';

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
  va.aadt,
  CAST(gc.geo_id AS INT),
  gc.lfn_id,
  gc.lf_name,
  gc.fcode,
  ST_AsGeoJSON(ST_ClosestPoint(gc.geom, ST_Centroid(gc.geom)))::json AS "geomPoint",
  ST_AsGeoJSON(ST_LineMerge(gc.geom))::json AS geom
  FROM gis.centreline gc
  LEFT JOIN volume.aadt va ON gc.geo_id = va.centreline_id
  WHERE gc.geo_id IN ($(centrelineIds:csv))`;
    const rows = await db.manyOrNone(sql, { centrelineIds });
    return rows.map(segmentToFeature);
  }

  static async segmentsIncidentTo(intersectionId) {
    const sql = `
SELECT
  va.aadt,
  CAST(gc.geo_id AS INT),
  gc.lfn_id,
  gc.lf_name,
  gc.fcode,
  ST_AsGeoJSON(ST_ClosestPoint(gc.geom, ST_Centroid(gc.geom)))::json AS "geomPoint",
  ST_AsGeoJSON(ST_lineMerge(gc.geom))::json AS geom
  FROM gis.centreline gc
  LEFT JOIN volume.aadt va ON gc.geo_id = va.centreline_id
  WHERE gc.fnode = $(intersectionId) OR gc.tnode = $(intersectionId)`;
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

  static async byFeature(feature) {
    const locations = await CentrelineDAO.byFeatures([feature]);
    const [location] = locations;
    return location;
  }

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
