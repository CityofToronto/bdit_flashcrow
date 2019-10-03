import ArrayUtils from '@/lib/ArrayUtils';
import { CardinalDirection } from '@/lib/Constants';
import { identity } from '@/lib/FunctionUtils';

/**
 * @typedef {Array<number>} GeoJsonPoint
 * @see https://tools.ietf.org/html/rfc7946#section-3.1.2
 */

/**
 *
 * @typedef {Array<GeoJsonPoint>} GeoJsonLineString
 * @see https://tools.ietf.org/html/rfc7946#section-3.1.4
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Difference (in degrees) between two bearings.
 *
 * @memberof GeometryUtils
 * @param {number} bearing0 - first bearing (in degrees)
 * @param {number} bearing1 - second bearing (in degrees)
 * @returns {number} `bearing1 - bearing0`, noralized to a value on the
 * interval `(-180, 180]`
 */
function getBearingDifference(bearing0, bearing1) {
  let dBearing = bearing1 - bearing0;
  while (dBearing <= -180) {
    dBearing += 360;
  }
  while (dBearing > 180) {
    dBearing -= 360;
  }
  return dBearing;
}

/**
 * @memberof GeometryUtils
 * @see https://www.movable-type.co.uk/scripts/latlong.html
 * @returns {number} great circle bearing between two points, normalized to
 * a value on the interval `[0, 360]`
 */
function getGreatCircleBearing([lng0, lat0], [lng1, lat1]) {
  if (lng0 === lng1 && lat0 === lat1) {
    return 0;
  }
  const lam0 = lng0 * DEG_TO_RAD;
  const phi0 = lat0 * DEG_TO_RAD;
  const lam1 = lng1 * DEG_TO_RAD;
  const phi1 = lat1 * DEG_TO_RAD;
  const dLam = lam1 - lam0;
  const y = Math.sin(dLam) * Math.cos(phi1);
  const x = Math.cos(phi0) * Math.sin(phi1) - Math.sin(phi0) * Math.cos(phi1) * Math.cos(dLam);
  let bearing = Math.atan2(y, x) * RAD_TO_DEG;
  if (bearing < 0) {
    bearing += 360;
  }
  return bearing;
}

/**
 * Estimate the point halfway along this line.
 *
 * TODO: make this do the same thing as ST_Closest(geom, ST_Centroid(geom)), which we
 * use in our Airflow jobs and backend API as a (better) estimate of halfway points.
 *
 * @memberof GeometryUtils
 * @param {GeoJsonLineString} coordinates - GeoJSON LineString coordinates
 * @returns {GeoJsonPoint} [lng, lat] coordinates of estimated halfway point
 */
function getLineStringMidpoint(coordinates) {
  const n = coordinates.length;
  if (n % 2 === 0) {
    const i = n / 2;
    const [lng0, lat0] = coordinates[i - 1];
    const [lng1, lat1] = coordinates[i];
    return [(lng0 + lng1) / 2, (lat0 + lat1) / 2];
  }
  const i = (n - 1) / 2;
  return coordinates[i];
}

/**
 * It is expected that `lineString` has `point` as one of its endpoints.
 *
 * @memberof GeometryUtils
 * @param {GeoJsonLineString} lineString
 * @param {GeoJsonPoint} point
 * @returns {?number} bearing of `lineString` from `point`, or
 * `null` if `lineString` does not have `point` as an endpoint
 */
function getLineStringBearingFrom(lineString, point) {
  const n = lineString.length;
  if (n < 2) {
    /*
     * As per RFC 7946, this should never happen.
     */
    throw new Error('invalid LineString!');
  }
  const [lng0, lat0] = point;
  const i = lineString.findIndex(([lng, lat]) => lng === lng0 && lat === lat0);
  if (i === 0) {
    return getGreatCircleBearing(point, lineString[1]);
  }
  if (i === n - 1) {
    return getGreatCircleBearing(point, lineString[n - 2]);
  }
  return null;
}

/**
 * Determine which `lineStrings` lie *most* in the cardinal directions from `point`.
 * This is useful when determining which segments lie in which directions from an
 * intersection.
 *
 * It is expected that each `LineString` has `point` as one of its endpoints.
 * This method will ignore any features in `lineStrings` that do not meet this
 * requirement.
 *
 * To calculate this, we compute the bearing at which each `LineString` leaves `point`.
 * If this bearing is within 45 degrees of a cardinal direction, we say that it lies in
 * that direction.  Of all features that lie in a cardinal direction, the one that
 * has an bearing closest to that direction is chosen as the "best directional candidate".
 *
 * The return value is a mapping from `CardinalDirection` values to indices into
 * `lineStrings` identifying the "best directional candidates".  Only directions with
 * suitable candidates are included in this mapping.
 *
 * @memberof GeometryUtils
 * @param {Array<GeoJsonLineString>} lineStrings
 * @param {GeoJsonPoint} point
 * @returns {Map<CardinalDirection, number>} mapping from `CardinalDirection` values
 * to indices into `lineStrings` representing best directional candidates (see above)
 */
function getDirectionCandidatesFrom(lineStrings, point) {
  const bestCandidates = new Map();
  const bearings = lineStrings
    .map((lineString, i) => [getLineStringBearingFrom(lineString, point), i])
    .filter(([bearing]) => bearing !== null);
  if (bearings.length === 0) {
    return bestCandidates;
  }
  CardinalDirection.enumValues.forEach((enumValue) => {
    const bearingDifferences = bearings
      .map(([bearing]) => Math.abs(getBearingDifference(bearing, enumValue.bearing)));
    const bestBearingIndex = ArrayUtils.getMinIndexBy(bearingDifferences, identity);
    const bestCandidateIndex = bearings[bestBearingIndex][1];
    if (bearingDifferences[bestBearingIndex] <= 45) {
      bestCandidates.set(enumValue, bestCandidateIndex);
    }
  });
  return bestCandidates;
}

/**
 * `GeometryUtils` contains helper methods for handling GeoJSON geometries, such as `LineString`
 * and `Point`.
 *
 * @namespace
 */
const GeometryUtils = {
  DEG_TO_RAD,
  getBearingDifference,
  getDirectionCandidatesFrom,
  getGreatCircleBearing,
  getLineStringBearingFrom,
  getLineStringMidpoint,
  RAD_TO_DEG,
};

export {
  GeometryUtils as default,
  DEG_TO_RAD,
  getBearingDifference,
  getDirectionCandidatesFrom,
  getGreatCircleBearing,
  getLineStringBearingFrom,
  getLineStringMidpoint,
  RAD_TO_DEG,
};
