import { CentrelineType } from '@/lib/Constants';

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
  };
}

function segmentToFeature({
  aadt,
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
    /*
     * Only SEGMENT features have AADT estimates.  When using `aadt`, you should usually
     * check `location.centrelineType === CentrelineType.SEGMENT` first.  You should also
     * check whether `location.aadt === null`, as AADT cannot be reliably estimated for all
     * segments.  (For instance, newer roads have no historical data to base this off of,
     * and some small laneways have insufficient data.)
     */
    aadt,
    centrelineId,
    centrelineType: CentrelineType.SEGMENT,
    description,
    featureCode,
    geom,
    lat,
    lng,
    /*
     * Only SEGMENT features have road IDs.  When using `roadId`, you should usually
     * check `location.centrelineType === CentrelineType.SEGMENT` first.
     */
    roadId,
  };
}

const NormalizeUtils = {
  intersectionToFeature,
  segmentToFeature,
};

export {
  NormalizeUtils as default,
  intersectionToFeature,
  segmentToFeature,
};
