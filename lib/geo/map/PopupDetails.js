import { CentrelineType } from '@/lib/Constants';
import {
  getCollisionByCollisionId,
  getLocationByCentreline,
  getPoiByCentrelineSummary,
  getStudiesByCentrelineSummary,
} from '@/lib/api/WebApi';

async function getCollisionDetails(feature) {
  const { collision_id: collisionId } = feature.properties;
  return getCollisionByCollisionId(collisionId);
}

async function getCentrelineDetails(feature, centrelineType) {
  const { centrelineId } = feature.properties;

  const tasks = [
    getLocationByCentreline({ centrelineId, centrelineType }),
    getPoiByCentrelineSummary({ centrelineId, centrelineType }),
  ];
  const [location, poiSummary] = await Promise.all(tasks);
  return { location, poiSummary };
}

async function getHospitalDetails(feature) {
  return feature;
}

async function getSchoolDetails(feature) {
  return feature;
}

async function getStudyRequestDetails(feature) {
  return feature.properties;
}

async function getStudyDetails(feature) {
  const { centrelineId, centrelineType } = feature.properties;
  const tasks = [
    getLocationByCentreline({ centrelineId, centrelineType }),
    getPoiByCentrelineSummary({ centrelineId, centrelineType }),
    getStudiesByCentrelineSummary([{ centrelineId, centrelineType }], {}),
  ];
  const [location, poiSummary, studySummary] = await Promise.all(tasks);
  return { location, poiSummary, studySummary };
}

async function getFeatureDetails(layerId, feature) {
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return getCollisionDetails(feature);
  }
  if (layerId === 'hospitalsLevel2' || layerId === 'hospitalsLevel1') {
    return getHospitalDetails(feature);
  }
  if (layerId === 'intersections') {
    return getCentrelineDetails(feature, CentrelineType.INTERSECTION);
  }
  if (layerId === 'midblocks') {
    return getCentrelineDetails(feature, CentrelineType.SEGMENT);
  }
  if (layerId === 'schoolsLevel2' || layerId === 'schoolsLevel1') {
    return getSchoolDetails(feature);
  }
  if (layerId === 'studies') {
    return getStudyDetails(feature);
  }
  if (layerId === 'locations-markers') {
    return getStudyRequestDetails(feature);
  }
  return null;
}

function getFeatureDetailsSuffix(layerId) {
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return 'Collision';
  }
  if (layerId === 'hospitalsLevel2' || layerId === 'hospitalsLevel1') {
    return 'Hospital';
  }
  if (layerId === 'intersections' || layerId === 'midblocks') {
    return 'Location';
  }
  if (layerId === 'schoolsLevel2' || layerId === 'schoolsLevel1') {
    return 'School';
  }
  if (layerId === 'studies') {
    return 'Study';
  }
  if (layerId === 'locations-markers') {
    return 'StudyRequest';
  }
  throw new Error(`invalid map layer for details: ${layerId}`);
}

/**
 * @namespace
 */
const PopupDetails = {
  getFeatureDetails,
  getFeatureDetailsSuffix,
};

export {
  PopupDetails as default,
  getFeatureDetails,
  getFeatureDetailsSuffix,
};
