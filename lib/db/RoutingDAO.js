import ArrayUtils from '@/lib/ArrayUtils';
import { centrelineKey, CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';

/**
 * @typedef {Object} IntersectionRoutingResult
 * @property {number} cost - total cost of the route
 * @property {Array<CentrelineFeature>} route - list of features representing the route
 */

/**
 * @typedef {Object} FeatureRoutingResult
 * @property {CentrelineFeature} next - next feature to continue routing from
 * @property {Array<CentrelineFeature>} route - list of features representing the route
 */

/**
 * Data access layer for centreline routing.  This was originally added to support corridor
 * interpolation for multi-location selections.
 *
 * A route is a (possibly empty) sequence of alternating intersections and midblocks connecting
 * zero or more waypoint features.  Although in general any set of two or more waypoints will
 * have many such routes connecting them, this class always looks for the single "best" route
 * using shortest-path algorithms available in the `pgrouting` extension.
 *
 * Note that these methods return routes as a sequence of {@link CentrelineFeature} objects.  If
 * you need the entire location metadata, use {@link CentrelineDAO.byFeatures} to resolve the
 * resulting features to locations.
 */
class RoutingDAO {
  /**
   *
   * @param {number} intersectionFrom - intersection to route from
   * @param {number} intersectionTo - intersection to route to
   * @returns {Object?} bounding box on the locations of `intersectionFrom`, `intersectionTo`
   * or `null` if one or both intersections do not exist
   */
  static async getIntersectionsBoundingBox(intersectionFrom, intersectionTo) {
    const sql = `
SELECT ST_X(geom) AS x, ST_Y(geom) AS y
FROM centreline.routing_vertices
WHERE id IN ($(intersectionFrom), $(intersectionTo))`;
    const rowsVertices = await db.manyOrNone(sql, { intersectionFrom, intersectionTo });
    if (rowsVertices.length !== 2) {
      return null;
    }
    let [{ x: xmin, y: ymin }, { x: xmax, y: ymax }] = rowsVertices;
    if (xmin > xmax) {
      const temp = xmin;
      xmin = xmax;
      xmax = temp;
    }
    if (ymin > ymax) {
      const temp = ymin;
      ymin = ymax;
      ymax = temp;
    }
    return {
      xmin,
      ymin,
      xmax,
      ymax,
    };
  }

  /**
   *
   * @param {number} intersectionFrom - intersection to route from
   * @param {number} intersectionTo - intersection to route to
   * @returns {IntersectionRoutingResult?} best route between `intersectionFrom` and
   * `intersectionTo`, excluding `intersectionFrom` but including `intersectionTo`,
   * or `null` if no such route exists
   */
  static async routeIntersections(intersectionFrom, intersectionTo) {
    if (intersectionFrom === intersectionTo) {
      return { cost: 0, route: [] };
    }
    const bbox = await RoutingDAO.getIntersectionsBoundingBox(intersectionFrom, intersectionTo);
    if (bbox === null) {
      return null;
    }
    const {
      xmin,
      ymin,
      xmax,
      ymax,
    } = bbox;

    const sql = `
SELECT node, edge, agg_cost AS "aggCost"
FROM pgr_astar(
  'WITH vertices AS (
    SELECT id
    FROM centreline.routing_vertices
    WHERE ST_DWithin(
      geom,
      ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 2952),
      500
    )
  )
  SELECT e.*
  FROM centreline.routing_edges e
  JOIN vertices vs ON e.source = vs.id
  JOIN vertices vt ON e.target = vt.id',
  $(intersectionFrom),
  $(intersectionTo),
  FALSE
)
ORDER BY seq ASC, path_seq ASC`;
    const rowsRouting = await db.manyOrNone(sql, { intersectionFrom, intersectionTo });
    if (rowsRouting.length === 0) {
      /*
       * As per [documentation](https://docs.pgrouting.org/2.4/en/pgr_aStar.html#pgr-astar),
       * `pgr_astar` returns the empty set if no route could be found.
       */
      return null;
    }

    const route = [];
    rowsRouting.forEach(({ node, edge }, i) => {
      if (i > 0) {
        route.push({
          centrelineType: CentrelineType.INTERSECTION,
          centrelineId: node,
        });
      }
      if (edge !== -1) {
        route.push({
          centrelineType: CentrelineType.SEGMENT,
          centrelineId: edge,
        });
      }
    });
    const cost = rowsRouting[rowsRouting.length - 1].aggCost;
    return { cost, route };
  }

  /**
   *
   * @param {CentrelineFeature} feature
   * @returns {Array<number>} if `feature` is an intersection, its ID; otherwise,
   * the intersection IDs of the two midblock endpoints
   */
  static async getRoutableIntersections(feature) {
    const { centrelineId, centrelineType } = feature;
    if (centrelineType === CentrelineType.INTERSECTION) {
      return [centrelineId];
    }
    const intersections = await CentrelineDAO.intersectionsIncidentTo(centrelineId);
    return intersections.map(intersection => intersection.centrelineId);
  }

  /**
   *
   * @param {Array<number>} intersections - array of intersections of length 1 or 2
   * @param {number} intersection - one of the intersections
   * @returns {number} if `intersections.length === 2`, the other intersection; otherwise,
   * `intersection` itself (so that we can continue routing if only one intersection was
   * found for whatever reason)
   */
  static getOtherIntersection(intersections, intersection) {
    if (intersections.length === 2 && intersection === intersections[0]) {
      return intersections[1];
    }
    return intersections[0];
  }

  /**
   *
   * @param {CentrelineFeature} featureFrom - feature to route from
   * @param {CentrelineFeature} featureTo - feature to route to
   * @returns {FeatureRoutingResult?} best route between `featureFrom` and
   * `featureTo`, excluding `featureFrom` but including `featureTo`, or `null`
   * if no such route exists
   */
  static async routeFeatures(featureFrom, featureTo) {
    if (featureFrom.centrelineType === featureTo.centrelineType
        && featureFrom.centrelineId === featureTo.centrelineId) {
      return { next: featureTo, route: [] };
    }

    // 1. route all pairs of intersections
    const [intersectionsFrom, intersectionsTo] = await Promise.all([
      RoutingDAO.getRoutableIntersections(featureFrom),
      RoutingDAO.getRoutableIntersections(featureTo),
    ]);
    if (intersectionsFrom.length === 0 || intersectionsTo.length === 0) {
      return null;
    }
    const intersectionPairs = [];
    intersectionsFrom.forEach((intersectionFrom) => {
      intersectionsTo.forEach((intersectionTo) => {
        intersectionPairs.push([intersectionFrom, intersectionTo]);
      });
    });
    const results = await Promise.all(intersectionPairs.map(
      ([intersectionFrom, intersectionTo]) => RoutingDAO.routeIntersections(
        intersectionFrom,
        intersectionTo,
      ),
    ));

    // 2. identify best route among all pairs
    const bestResultIndex = ArrayUtils.getMinIndexBy(
      results,
      result => (result === null ? Infinity : result.cost),
    );
    const bestResult = results[bestResultIndex];
    if (bestResult === null) {
      return null;
    }
    const { route: bestRoute } = bestResult;
    const [intersectionFrom, intersectionTo] = intersectionPairs[bestResultIndex];

    // 3. build result
    const isIntersectionFrom = featureFrom.centrelineType === CentrelineType.INTERSECTION;
    const isIntersectionTo = featureTo.centrelineType === CentrelineType.INTERSECTION;
    if (isIntersectionFrom) {
      if (isIntersectionTo) {
        // 3a. from intersection to intersection
        return { next: featureTo, route: bestRoute };
      }
      /*
       * 3b. from intersection to midblock - in this case, we've routed to one of the endpoints
       * of `toFeature`.  We need to add `toFeature` to that route, and return its other endpoint
       * as the next feature to continue routing from.
       */
      const route = [...bestRoute, featureTo];
      let next = RoutingDAO.getOtherIntersection(intersectionsTo, intersectionTo);
      next = { centrelineId: next, centrelineType: CentrelineType.INTERSECTION };
      return { next, route };
    }
    const routeFrom = {
      centrelineId: intersectionFrom,
      centrelineType: CentrelineType.INTERSECTION,
    };
    if (isIntersectionTo) {
      /*
       * 3c. from midblock to intersection - in this case, we've routed from one of the endpoints
       * of `fromFeature`.  We need to add that endpoint to the beginning of the route.
       */
      const route = [routeFrom, ...bestRoute];
      return { next: featureTo, route };
    }
    /*
     * 3d. from midblock to midblock - here both of the additional requirements in 3b and 3c
     * apply.
     */
    const route = [routeFrom, ...bestRoute, featureTo];
    let next = RoutingDAO.getOtherIntersection(intersectionsTo, intersectionTo);
    next = { centrelineId: next, centrelineType: CentrelineType.INTERSECTION };
    return { next, route };
  }

  /**
   * Returns a corridor on the given waypoint features.  Note that this makes at least `n - 1`
   * calls (and possibly as many as `2n` calls) to `pgr_astar`, which can be expensive for
   * large waypoint sets or over waypoints that are far apart.  Furthermore, these calls
   * are not parallelized - we sequentially route over each consecutive pair of features,
   * using the information of previous calls to help resolve routes that involve midblock
   * waypoints.
   *
   * For these reasons, user-facing APIs that call this method should consider placing
   * limitations on use (e.g. size of input set, distance covered, rate limiting, etc.)
   *
   * A corridor over the waypoint features exists if and only if all such `pgr_astar` calls
   * return a valid route.  This method does not attempt to route "partial" corridors.
   *
   * @param {Array<CentrelineFeature>} features - waypoints to connect with corridor
   * @returns {Array<CentrelineFeature>?} corridor connecting waypoints, or `null` if no such
   * corridor exists
   */
  static async routeCorridor(features) {
    const featuresConsecutiveUniq = ArrayUtils.consecutiveUniqBy(features, centrelineKey);
    const n = featuresConsecutiveUniq.length;
    if (n < 2) {
      return featuresConsecutiveUniq;
    }
    let featureFrom = featuresConsecutiveUniq[0];
    const corridor = [featureFrom];
    for (let i = 1; i < n; i++) {
      const featureTo = featuresConsecutiveUniq[i];
      /* eslint-disable-next-line no-await-in-loop */
      const result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
      if (result === null) {
        return null;
      }
      const { route, next } = result;
      featureFrom = next;
      corridor.push(...route);
      if (i < n - 1 && (
        featureFrom.centrelineType !== featureTo.centrelineType
        || featureFrom.centrelineId !== featureTo.centrelineId
      )) {
        corridor.push(featureFrom);
      }
    }
    return corridor;
  }
}

export default RoutingDAO;
