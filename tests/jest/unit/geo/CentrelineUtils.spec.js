import {
  CentrelineType,
  LocationSelectionType,
  RoadIntersectionType,
  RoadSegmentType,
  StudyType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';
import {
  getLocationFeatureType,
  getLocationStudyTypes,
  getLocationsCorridorDescription,
  getLocationsDescription,
  getLocationsSelectionDescription,
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
    expect(getLocationStudyTypes(location)).toEqual([
      StudyType.TMC,
      StudyType.PED_DELAY,
      StudyType.PXO_OBSERVE,
      StudyType.PED_CLASS,
      StudyType.PED_COUNT,
      StudyType.ATR_VOLUME_BICYCLE,
      StudyType.BIKE_CLASS,
      StudyType.VID_OBSERVE,
      StudyType.SCHOOL_CROSS,
    ]);
  });
  RoadSegmentType.enumValues.forEach(({ featureCode }) => {
    const location = {
      centrelineType: CentrelineType.SEGMENT,
      featureCode,
    };
    const studyTypes = getLocationStudyTypes(location);
    expect(studyTypes).toBeInstanceOf(Array);
    expect(getLocationStudyTypes(location)).not.toContain(StudyType.OTHER);
  });
  const location = {
    centrelineType: CentrelineType.SEGMENT,
    featureCode: null,
  };
  expect(getLocationStudyTypes(location)).toBeInstanceOf(Array);
  expect(getLocationStudyTypes(location)).not.toContain(StudyType.OTHER);
});

test('CentrelineUtils.getLocationsCorridorDescription', () => {
  let locations = [];
  expect(getLocationsCorridorDescription(locations)).toBeNull();

  locations = [
    { description: 'Warden and St Clair' },
  ];
  expect(getLocationsCorridorDescription(locations)).toEqual('Warden and St Clair');

  locations = [
    { description: 'Warden and St Clair' },
    { description: 'Warden and Bell Estate' },
  ];
  expect(getLocationsCorridorDescription(locations)).toEqual(
    'Warden and St Clair \u2192 Warden and Bell Estate',
  );

  locations = [
    { description: 'Warden and St Clair' },
    { description: 'Warden and Bell Estate' },
    { description: 'Warden and Cataraqui Cres' },
  ];
  expect(getLocationsCorridorDescription(locations)).toEqual(
    'Warden and St Clair \u2192 Warden and Cataraqui Cres',
  );
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

test('CentrelineUtils.getLocationsSelectionDescription', () => {
  let locations = [];
  expect(getLocationsSelectionDescription({
    locations,
    selectionType: LocationSelectionType.POINTS,
  })).toBeNull();
  expect(getLocationsSelectionDescription({
    locations,
    selectionType: LocationSelectionType.CORRIDOR,
  })).toBeNull();

  locations = [
    { description: 'Warden and St Clair' },
  ];
  expect(getLocationsSelectionDescription({
    locations,
    selectionType: LocationSelectionType.POINTS,
  })).toEqual('Warden and St Clair');
  expect(getLocationsSelectionDescription({
    locations,
    selectionType: LocationSelectionType.CORRIDOR,
  })).toEqual('Warden and St Clair');

  locations = [
    { description: 'Warden and St Clair' },
    { description: 'Warden and Bell Estate' },
  ];
  expect(getLocationsSelectionDescription({
    locations,
    selectionType: LocationSelectionType.POINTS,
  })).toEqual('Warden and St Clair + 1 location');

  locations = [
    { description: 'Warden and St Clair' },
    { description: 'Warden and Bell Estate' },
    { description: 'Warden and Cataraqui Cres' },
  ];
  expect(getLocationsSelectionDescription({
    locations,
    selectionType: LocationSelectionType.CORRIDOR,
  })).toEqual(
    'Warden and St Clair \u2192 Warden and Cataraqui Cres',
  );
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
