import {
  CentrelineType,
  RoadIntersectionType,
  RoadSegmentType,
  StudyType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';
import {
  getLocationFeatureType,
  getLocationStudyTypes,
  getLocationsDescription,
  getLocationsIconProps,
  getLocationsWaypointIndices,
} from '@/lib/geo/CentrelineUtils';

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
    featureCode: RoadIntersectionType.LANEWAY.featureCode,
  };
  expect(getLocationFeatureType(location)).toBe(RoadIntersectionType.LANEWAY);

  location = {
    centrelineType: -1,
    featureCode: RoadIntersectionType.LANEWAY.featureCode,
  };
  expect(() => {
    getLocationFeatureType(location);
  }).toThrow(InvalidCentrelineTypeError);
});

test('CentrelineUtils.getLocationStudyTypes', () => {
  RoadIntersectionType.enumValues.forEach(({ featureCode }) => {
    const location = {
      centrelineType: CentrelineType.INTERSECTION,
      featureCode,
    };
    expect(getLocationStudyTypes(location)).toEqual([StudyType.TMC]);
  });
  RoadSegmentType.enumValues.forEach(({ featureCode }) => {
    const location = {
      centrelineType: CentrelineType.SEGMENT,
      featureCode,
    };
    const studyTypes = getLocationStudyTypes(location);
    expect(studyTypes).toBeInstanceOf(Array);
    expect(studyTypes).not.toContain(StudyType.TMC);
  });
  let location = {
    centrelineType: CentrelineType.SEGMENT,
    featureCode: null,
  };
  expect(getLocationStudyTypes(location)).toBeInstanceOf(Array);

  location = {
    centrelineType: CentrelineType.SEGMENT,
    featureCode: RoadSegmentType.MAJOR_ARTERIAL.featureCode,
  };
  expect(getLocationStudyTypes(location)).toContain(StudyType.RESCU);

  location = {
    centrelineType: CentrelineType.SEGMENT,
    featureCode: RoadSegmentType.MINOR_ARTERIAL.featureCode,
  };
  expect(getLocationStudyTypes(location)).not.toContain(StudyType.RESCU);
});

test('CentrelineUtils.getLocationsDescription', () => {
  let locations = [];
  expect(getLocationsDescription(locations)).toBeNull();

  locations = [
    { description: 'Warden and St Clair' },
  ];
  expect(getLocationsDescription(locations)).toEqual('Warden and St Clair');

  locations = [
    { description: 'Warden and St Clair' },
    { description: 'Warden and Bell Estate' },
  ];
  expect(getLocationsDescription(locations)).toEqual('Warden and St Clair + 1 location');

  locations = [
    { description: 'Warden and St Clair' },
    { description: 'Warden and Bell Estate' },
    { description: 'Warden and Cataraqui Cres' },
  ];
  expect(getLocationsDescription(locations)).toEqual('Warden and St Clair + 2 locations');
});

test('CentrelineUtils.getLocationsIconProps', () => {
  const waypoints = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13454752, centrelineType: CentrelineType.INTERSECTION },
  ];
  const locations = [
    waypoints[0],
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    waypoints[1],
    waypoints[3],
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    waypoints[4],
    { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444715, centrelineType: CentrelineType.SEGMENT },
    waypoints[6],
  ];
  expect(getLocationsIconProps(locations, waypoints)).toEqual([
    { locationIndex: 0, midblock: false },
    { locationIndex: -1, midblock: true },
    { locationIndex: -1, midblock: false },
    { locationIndex: -1, midblock: true },
    { locationIndex: 2, midblock: false },
    { locationIndex: 3, midblock: true },
    { locationIndex: -1, midblock: false },
    { locationIndex: -1, midblock: true },
    { locationIndex: -1, midblock: false },
    { locationIndex: 5, midblock: true },
    { locationIndex: -1, midblock: false },
    { locationIndex: -1, midblock: true },
    { locationIndex: 6, midblock: false },
  ]);
});

test('CentrelineUtils.getLocationsWaypointIndices', () => {
  let waypoints = [];
  let locations = [];
  expect(getLocationsWaypointIndices(locations, waypoints)).toEqual([]);

  locations = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
  ];
  expect(getLocationsWaypointIndices(locations, waypoints)).toEqual([[]]);

  waypoints = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
  ];
  expect(getLocationsWaypointIndices(locations, waypoints)).toEqual([[0]]);

  waypoints = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
  ];
  expect(getLocationsWaypointIndices(locations, waypoints)).toEqual([[0, 1]]);

  waypoints = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13454752, centrelineType: CentrelineType.INTERSECTION },
  ];
  locations = [
    waypoints[0],
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    waypoints[1],
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    waypoints[2],
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    waypoints[3],
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    waypoints[4],
    { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444715, centrelineType: CentrelineType.SEGMENT },
    waypoints[5],
  ];
  expect(getLocationsWaypointIndices(locations, waypoints)).toEqual([
    [0],
    [],
    [],
    [],
    [1],
    [],
    [2],
    [],
    [],
    [3],
    [],
    [],
    [],
    [4],
    [],
    [],
    [5],
  ]);

  waypoints = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13454752, centrelineType: CentrelineType.INTERSECTION },
  ];
  locations = [
    waypoints[0],
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    waypoints[1],
    waypoints[3],
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    waypoints[4],
    { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444715, centrelineType: CentrelineType.SEGMENT },
    waypoints[6],
  ];
  expect(getLocationsWaypointIndices(locations, waypoints)).toEqual([
    [0],
    [],
    [],
    [],
    [1, 2],
    [3],
    [],
    [],
    [],
    [4, 5],
    [],
    [],
    [6],
  ]);
});
