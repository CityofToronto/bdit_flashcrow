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
    /*
     * Only SEGMENT features have road IDs.  When using `roadId`, you should usually
     * check `feature.centrelineType === CentrelineType.SEGMENT` first.
     */
    roadId: null,
  };
}

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

const NormalizeUtils = {
  intersectionToFeature,
  segmentToFeature,
};

export {
  NormalizeUtils as default,
  intersectionToFeature,
  segmentToFeature,
};
