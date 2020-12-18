import { CentrelineType, LocationSearchType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';

const REGEX_SPECIAL_TERM = /([A-Za-z]+):(\d*)/;
const TERMS_ARTERY = ['artery'];
const TERMS_SIGNAL = ['px', 'signal', 'tcs'];

/**
 * Data access layer for location search, which looks up centreline features matching a given
 * query.  While this could have been included within {@link CentrelineDAO}, moving it here
 * allows us to minimize clutter in both places and make the intent of each clearer.
 *
 * To clarify: this DAO thinks of the centreline as a collection of labelled features to be
 * searched over with textual queries.  {@link CentrelineDAO} thinks of the centreline as
 * a graph, to be queried with node / edge identifiers and traversed via adjacency relations.
 */
class LocationSearchDAO {
  /**
   * Matches arterycodes as provided via special search terms like `artery:1234`.
   *
   * Unlike {@link LocationSearchDAO.intersectionSuggestions}, this method doesn't really
   * "suggest" results - it does an exact match on the arterycode.
   *
   * @param {number} arterycode - ID of artery
   * @returns {Array<Object>} - array containing the centreline feature corresponding
   * to the given artery if found, empty array otherwise
   */
  static async arterySuggestions(arterycode) {
    // TODO: implement using counts.arteries_centreline
    const sql = `
SELECT
  centreline_id AS "centrelineId",
  centreline_type AS "centrelineType"
FROM counts.arteries_centreline
WHERE arterycode = $(arterycode)`;
    const row = await db.oneOrNone(sql, { arterycode });
    if (row === null) {
      return [];
    }
    const { centrelineId, centrelineType } = row;
    const feature = { centrelineId, centrelineType };
    const location = await CentrelineDAO.byFeature(feature);
    return [location];
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
    int_id AS "centrelineId",
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
  "centrelineId",
  f_rank_cd * 20 + f_substring_match * 0.5 - abs(501245 - f_feature_code) / 100.0 AS score
FROM candidates
ORDER BY score DESC
LIMIT $(limit);`;
    const rowsExact = await db.manyOrNone(sqlExact, { limit, query });
    /*
     * Although we don't currently surface the score anywhere in the frontend, we preserve
     * them in the results in case they prove helpful eventually.
     */
    const featuresExact = rowsExact.map(({ centrelineId }) => ({
      centrelineId,
      centrelineType: CentrelineType.INTERSECTION,
    }));

    /*
     * If we have enough results, stop; otherwise, continue to approximate matching and
     * fill out the result list.
     */
    const limitApprox = limit - featuresExact.length;
    if (limitApprox <= 0) {
      return CentrelineDAO.byFeatures(featuresExact);
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
    int_id AS "centrelineId",
    word_similarity(
      replace(replace(plainto_tsquery($(query))::text, '''', ''), ' &', ''),
      intersec5
    ) AS f_word_similarity,
    elevatio9 AS f_feature_code
  FROM location_search.centreline_intersection
  WHERE replace(replace(plainto_tsquery($(query))::text, '''', ''), ' &', '') <% intersec5
)
SELECT
  "centrelineId",
  f_word_similarity * 2 - abs(501245 - f_feature_code) / 100.0 AS score
FROM candidates
ORDER BY score DESC
LIMIT $(limitApprox);`;
    const rowsApprox = await db.manyOrNone(sqlApprox, { limitApprox, query });
    const featuresApprox = rowsApprox.map(({ centrelineId }) => ({
      centrelineId,
      centrelineType: CentrelineType.INTERSECTION,
    }));
    const features = featuresExact.concat(featuresApprox);
    return CentrelineDAO.byFeatures(features);
  }

  /**
   * Matches traffic signals using their PX / TSC number, as provided via special search
   * terms like `px:1234`.
   *
   * Unlike {@link LocationSearchDAO.intersectionSuggestions}, this method doesn't really
   * "suggest" results - it does an exact match on the PX / TSC number.
   *
   * @param {number} px - PX / TSC number
   * @returns {Array<Object>} - array containing the centreline feature corresponding
   * to the given signal if found, empty array otherwise
   */
  static async trafficSignalSuggestions(px) {
    // TODO: also include midblock conflation!
    const sql = `
SELECT centreline_id AS "centrelineId"
FROM location_search.traffic_signal
WHERE ts.px = $(px)`;
    const rows = await db.manyOrNone(sql, { px });
    const features = rows.map(({ centrelineId }) => ({
      centrelineId,
      centrelineType: CentrelineType.INTERSECTION,
    }));
    return CentrelineDAO.byFeatures(features);
  }

  /**
   * Main entry point to location search.
   *
   * @param {Array<LocationSearchType>?} types - types of entities to search over
   * @param {string} query - textual query for search
   * @param {number} limit - maximum number of results to return
   * @returns {Array} ranked array of results matching the query if any, up to
   * `limit` results; best match first
   */
  static async getSuggestions(types, query, limit) {
    const queryNormalized = query.trim();
    let typesNormalized = types;
    if (typesNormalized === null) {
      typesNormalized = LocationSearchType.enumValues;
    }

    const match = REGEX_SPECIAL_TERM.exec(queryNormalized);
    if (match !== null) {
      const value = parseInt(match[2], 10);
      if (Number.isNaN(value)) {
        return [];
      }

      const termPrefix = match[1];
      if (typesNormalized.includes(LocationSearchType.ARTERY)
        && TERMS_ARTERY.some(term => term.startsWith(termPrefix))) {
        return LocationSearchDAO.arterySuggestions(value);
      }
      if (typesNormalized.includes(LocationSearchType.SIGNAL)
        && TERMS_SIGNAL.some(term => term.startsWith(termPrefix))) {
        return LocationSearchDAO.trafficSignalSuggestions(value);
      }
      return [];
    }

    if (typesNormalized.includes(LocationSearchType.INTERSECTION)) {
      return LocationSearchDAO.intersectionSuggestions(query, limit);
    }
    return [];
  }
}

export default LocationSearchDAO;
