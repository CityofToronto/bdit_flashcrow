/**
 * Estimate the point halfway along this line.
 *
 * TODO: make this do the same thing as ST_Closest(geom, ST_Centroid(geom)), which we
 * use in our Airflow jobs and backend API as a (better) estimate of halfway points.
 *
 * @param {Array<Array<number>>} coordinates - GeoJSON LineString coordinates
 * @returns {Array<number>} [lng, lat] coordinates of estimated halfway point
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

const GeometryUtils = {
  getLineStringMidpoint,
};

export {
  GeometryUtils as default,
  getLineStringMidpoint,
};
