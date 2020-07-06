import {
  CentrelineType,
  RoadIntersectionType,
  RoadSegmentType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

function getLocationFeatureType(location) {
  if (location === null) {
    return null;
  }
  const { centrelineType, featureCode = null } = location;
  if (featureCode === null) {
    return null;
  }
  if (centrelineType === CentrelineType.SEGMENT) {
    return RoadSegmentType.enumValueOf(featureCode, 'featureCode');
  }
  if (centrelineType === CentrelineType.INTERSECTION) {
    return RoadIntersectionType.enumValueOf(featureCode, 'featureCode');
  }
  throw new InvalidCentrelineTypeError(centrelineType);
}

function getLocationsDescription(locations) {
  const n = locations.length;
  if (n === 0) {
    return null;
  }
  const [{ description }] = locations;
  if (n === 1) {
    return description;
  }
  if (n === 2) {
    return `${description} + 1 location`;
  }
  return `${description} + ${n - 1} locations`;
}

const CentrelineUtils = {
  getLocationFeatureType,
  getLocationsDescription,
};

export {
  CentrelineUtils as default,
  getLocationFeatureType,
  getLocationsDescription,
};
