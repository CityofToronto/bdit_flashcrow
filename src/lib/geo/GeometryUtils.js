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
 * Difference (in degrees) between two angles.
 *
 * @param {number} angle0
 * @param {number} angle1
 * @returns {number} difference (in degrees) between two angles; always returns
 * a value on the interval `(-180, 180]`
 */
function getAngleDifference(angle0, angle1) {
  let dAngle = angle1 - angle0;
  while (dAngle <= -180) {
    dAngle += 360;
  }
  while (dAngle > 180) {
    dAngle -= 360;
  }
  return dAngle;
}

/**
 * @see https://www.movable-type.co.uk/scripts/latlong.html
 */
function getGreatCircleAngle([lng0, lat0], [lng1, lat1]) {
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
  const angle = Math.atan2(y, x);
  return angle * RAD_TO_DEG;
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
 * @param {GeoJsonLineString} lineString
 * @param {GeoJsonPoint} point
 * @returns {?number} angle (in degrees) of `lineString` from `point`, or
 * `null` if `lineString` does not have `point` as an endpoint
 */
function getLineStringAngleFrom(lineString, point) {
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
    return getGreatCircleAngle(point, lineString[1]);
  }
  if (i === n - 1) {
    return getGreatCircleAngle(point, lineString[n - 2]);
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
 * To calculate this, we compute the angle at which each `LineString` leaves `point`.
 * If this angle is within 45 degrees of a cardinal direction, we say that it lies in
 * that direction.  Of all features that lie in a cardinal direction, the one that
 * has an angle closest to that direction is chosen as the "best directional candidate".
 *
 * The return value is a mapping from `CardinalDirection` values to indices into
 * `lineStrings` identifying the "best directional candidates".  Only directions with
 * suitable candidates are included in this mapping.
 *
 * @memberof GeometryUtils
 * @param {Array<GeoJsonLineString>} lineStrings
 * @param {GeoJsonPoint} point
 * @returns {Object<CardinalDirection, number>} mapping from `CardinalDirection` values
 * to indices into `lineStrings` representing best directional candidates (see above)
 */
function getDirectionCandidatesFrom(lineStrings, point) {
  const angles = lineStrings
    .map(([lineString, i]) => [getLineStringAngleFrom(lineString, point), i])
    .filter(([angle]) => angle !== null);
  const bestCandidates = {};
  CardinalDirection.enumValues.forEach((enumValue) => {
    const angleDifferences = angles
      .map(([angle]) => Math.abs(getAngleDifference(angle, enumValue.angle)));
    const bestAngleIndex = ArrayUtils.getMinIndexBy(angleDifferences, identity);
    const bestCandidateIndex = angles[bestAngleIndex][1];
    if (angleDifferences[bestCandidateIndex] <= 45) {
      bestCandidates[enumValue] = bestCandidateIndex;
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
  getAngleDifference,
  getDirectionCandidatesFrom,
  getGreatCircleAngle,
  getLineStringAngleFrom,
  getLineStringMidpoint,
  RAD_TO_DEG,
};

export {
  GeometryUtils as default,
  DEG_TO_RAD,
  getAngleDifference,
  getDirectionCandidatesFrom,
  getGreatCircleAngle,
  getLineStringAngleFrom,
  getLineStringMidpoint,
  RAD_TO_DEG,
};
