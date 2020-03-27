
import {
  CentrelineType,
  RoadIntersectionType,
  RoadSegmentType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';

test('CentrelineUtils.getLocationFeatureType', () => {
  expect(getLocationFeatureType(null)).toBeNull();

  let location = {
    centrelineType: CentrelineType.SEGMENT,
  };
  expect(getLocationFeatureType(location)).toBeNull();

  location = {
    centrelineType: CentrelineType.SEGMENT,
    featureCode: RoadSegmentType.MINOR_ARTERIAL.featureCode,
  };
  expect(getLocationFeatureType(location)).toBe(RoadSegmentType.MINOR_ARTERIAL);

  location = {
    centrelineType: CentrelineType.INTERSECTION,
    featureCode: RoadIntersectionType.PEDESTRIAN.featureCode,
  };
  expect(getLocationFeatureType(location)).toBe(RoadIntersectionType.PEDESTRIAN);

  location = {
    centrelineType: -1,
    featureCode: RoadIntersectionType.PEDESTRIAN.featureCode,
  };
  expect(() => {
    getLocationFeatureType(location);
  }).toThrow(InvalidCentrelineTypeError);
});
