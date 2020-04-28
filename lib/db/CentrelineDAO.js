import db from '@/lib/db/db';
import {
  centrelineKey,
  CentrelineType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

function segmentToFeature({
  lf_name: description,
  fcode: featureCode,
  geo_id: geoId,
  geom,
  geomPoint,
  lfn_id: roadId,
}) {
  const centrelineId = parseInt(geoId, 10);
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
  int_id: intId,
}) {
  const centrelineId = parseInt(intId, 10);
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

  /**
   * Suggests intersections matching a textual prefix query.  The set of suggestions may include
   * both exact matches (e.g. 'Danforth' for 'Danf') and approximate matches (e.g. 'Danforth'
   * for 'Damf').  Exact matches take priority.
   *
   * Each type of match uses a linear combination of features for ranking: we extract a series of
   * numeric features from each candidate intersection, multiply each feature by a predetermined
   * weight, and add the results.  In our case, the weights have been chosen such that each
   * feature lies roughly within the unit interval.
   *
   * To speed up these queries, we limit the candidate set using PostgreSQL's `@@` and `<%`
   * operators in conjunction with appropriate indexes.
   *
   * @param {string} query - query to suggest intersections for
   * @param {number} limit - number of results to return
   * @returns {Array<Object>} - array of suggestions for the given query, containing at
   * most `limit` results
   */
  static async intersectionSuggestions(query, limit) {
    /*
     * For exact matches, we use `tsvector` and `tsquery` full-text support together with
     * these features:
     *
     * - `f_rank_cd`: number of matched terms in the intersection name, normalized by
     *   intersection name length to avoid biasing towards long expressway ramp names;
     * - `f_substring_match`: whether the intersection name contains the original query
     *   as a substring, as a workaround for word stemming applied by `plainto_tsquery`;
     * - `f_feature_code`: the type of intersection, either 501100 (expressway),
     *   501200 (major), or 501300 (minor).
     *
     * For `f_rank_cd`, `2 | 4` is a bitmask that controls normalization of term count.
     *
     * For `f_feature_code`, we make the assumption that major intersections are slightly
     * more relevant than minor intersections, as they often help users in landmarking.
     * Both are typically much more useful than expressway intersections.  The expression
     *
     *     -abs(501245 - f_feature_code) / 100.0
     *
     * is chosen here to rank in this order.
     */
    const sqlExact = `
WITH candidates AS (
  SELECT
    int_id,
    ts_rank_cd(
      to_tsvector('english', intersec5),
      (plainto_tsquery($(query))::text || ':*')::tsquery,
      2 | 4
    ) AS f_rank_cd,
    CASE
      WHEN position(lower($(query)) IN lower(intersec5)) != 0 THEN 1
      ELSE 0
    END AS f_substring_match,
    elevatio9 AS f_feature_code
  FROM location_search.centreline_intersection
  WHERE to_tsvector('english', intersec5) @@ (plainto_tsquery($(query))::text || ':*')::tsquery
)
SELECT
  ci.int_id,
  ci.intersec5,
  ci.elevatio9,
  ST_AsGeoJSON(ci.geom)::json AS geom,
  f_rank_cd * 20 + f_substring_match * 0.5 - abs(501245 - f_feature_code) / 100.0 AS score
FROM candidates JOIN gis.centreline_intersection ci USING (int_id)
ORDER BY score DESC, intersec5 ASC
LIMIT $(limit);`;
    const rowsExact = await db.manyOrNone(sqlExact, { limit, query });
    /*
     * Although we don't currently surface the score anywhere in the frontend, we preserve
     * them in the results in case they prove helpful eventually.
     */
    const intersectionsExact = rowsExact.map(({ score, ...intersection }) => ({
      score,
      ...intersectionToFeature(intersection),
    }));

    /*
     * If we have enough results, stop; otherwise, continue to approximate matching and
     * fill out the result list.
     */
    const limitApprox = limit - intersectionsExact.length;
    if (limitApprox <= 0) {
      return intersectionsExact;
    }

    /*
     * For approximate matches, we use `pg_trgm` trigram support together with these features:
     *
     * - `f_word_similarity`: computes trigram similarity between query terms and tokens in
     *   intersection names;
     * - `f_feature_code`: same as for exact matches.
     *
     * The lower `pg_trgm.word_similarity_threshold` is chosen to balance precision and recall;
     * PostgreSQL defaults this parameter to 0.6.
     *
     * This expression normalizes the query, removing stopwords and punctuation:
     *
     *     replace(replace(plainto_tsquery($(query))::text, '''', ''), ' &', '')
     */
    const sqlApprox = `
SET pg_trgm.word_similarity_threshold = 0.3;
WITH candidates AS (
  SELECT
    int_id,
    word_similarity(
      replace(replace(plainto_tsquery($(query))::text, '''', ''), ' &', ''),
      intersec5
    ) AS f_word_similarity,
    elevatio9 AS f_feature_code
  FROM location_search.centreline_intersection
  WHERE replace(replace(plainto_tsquery($(query))::text, '''', ''), ' &', '') <% intersec5
)
SELECT
  ci.int_id,
  ci.intersec5,
  ci.elevatio9,
  ST_AsGeoJSON(ci.geom)::json AS geom,
  f_word_similarity * 2 - abs(501245 - f_feature_code) / 100.0 AS score
FROM candidates JOIN gis.centreline_intersection ci USING (int_id)
ORDER BY score DESC, intersec5 ASC
LIMIT $(limitApprox);`;
    const rowsApprox = await db.manyOrNone(sqlApprox, {
      limitApprox,
      query,
    });
    const intersectionsApprox = rowsApprox.map(({ score, ...intersection }) => ({
      score,
      ...intersectionToFeature(intersection),
    }));
    return intersectionsExact.concat(intersectionsApprox);
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
