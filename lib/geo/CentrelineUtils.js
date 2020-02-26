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

const CentrelineUtils = {
  getLocationFeatureType,
};

export {
  CentrelineUtils as default,
  getLocationFeatureType,
};
