import { CardinalDirection } from '@/lib/Constants';
import {
  getBearingDifference,
  getDirectionCandidatesFrom,
  getGeometryMidpoint,
  getGreatCircleBearing,
  getLineStringBearingFrom,
  getLineStringMidpoint,
} from '@/lib/geo/GeometryUtils';

const LOCATION_703_DM = [-79.333567, 43.709277];
const LOCATION_CITY_HALL = [-79.384187, 43.653331];

test('GeometryUtils.getBearingDifference', () => {
  expect(getBearingDifference(212, 212)).toBe(0);

  expect(getBearingDifference(212, 211)).toBe(-1);
  expect(getBearingDifference(212, 213)).toBe(1);

  expect(getBearingDifference(359, 1)).toBe(2);
  expect(getBearingDifference(1, 359)).toBe(-2);

  expect(getBearingDifference(90, 270)).toBe(180);
  expect(getBearingDifference(270, 90)).toBe(180);
});

test('GeometryUtils.getDirectionCandidatesFrom', () => {
  let lineStrings;
  let point;
  let candidates;

  lineStrings = [];
  point = LOCATION_703_DM;
  candidates = getDirectionCandidatesFrom(lineStrings, point);
  expect(candidates.size).toBe(0);

  lineStrings = [
    [[0, 0], [0, 1]],
    [[0, -1], [0, 0]],
    [[1, 0], [0, 0]],
    [[0, 1], [0, -1]],
    [[0, 0], [-1, 0]],
  ];
  point = [0, 0];
  candidates = getDirectionCandidatesFrom(lineStrings, point);
  expect(candidates.size).toBe(4);
  expect(candidates.get(CardinalDirection.NORTH)).toBe(0);
  expect(candidates.get(CardinalDirection.EAST)).toBe(2);
  expect(candidates.get(CardinalDirection.SOUTH)).toBe(1);
  expect(candidates.get(CardinalDirection.WEST)).toBe(4);

  lineStrings = [
    [LOCATION_703_DM, LOCATION_CITY_HALL],
  ];
  point = LOCATION_703_DM;
  candidates = getDirectionCandidatesFrom(lineStrings, point);
  expect(candidates.size).toBe(1);
  expect(candidates.get(CardinalDirection.SOUTH)).toBe(0);
});

test('GeometryUtils.getGeometryMidpoint', () => {
  let feature = {
    coordinates: [0, 1],
    type: 'Point',
  };
  expect(getGeometryMidpoint(feature)).toEqual(feature.coordinates);

  feature = {
    coordinates: [[0, 1], [3, 5]],
    type: 'LineString',
  };
  expect(getGeometryMidpoint(feature)).toEqual([1.5, 3]);

  feature = {
    coordinates: [
      [[0, 1], [3, 5]],
      [[5, 4], [4, 2]],
    ],
    type: 'MultiLineString',
  };
  expect(getGeometryMidpoint(feature)).toEqual([3, 3]);

  feature = {
    coordinates: [
      [[0, 1], [3, 5]],
      [[5, 4], [4, 2]],
    ],
    type: 'Polygon',
  };
  expect(() => {
    getGeometryMidpoint(feature);
  }).toThrow();
});

test('GeometryUtils.getGreatCircleBearing', () => {
  // raw cardinal directions
  expect(getGreatCircleBearing([0, 0], [0, 1])).toBeCloseTo(0);
  expect(getGreatCircleBearing([0, 0], [1, 0])).toBeCloseTo(90);
  expect(getGreatCircleBearing([0, 0], [0, -1])).toBeCloseTo(180);
  expect(getGreatCircleBearing([0, 0], [-1, 0])).toBeCloseTo(270);

  /*
   * Toronto: 703 Don Mills to City Hall
   * see https://www.movable-type.co.uk/scripts/latlong.html for reference calculation
   */
  expect(getGreatCircleBearing(LOCATION_703_DM, LOCATION_CITY_HALL)).toBeCloseTo(213.216);

  // degenerate case
  expect(getGreatCircleBearing(LOCATION_703_DM, LOCATION_703_DM)).toBe(0);
});

test('GeometryUtils.getLineStringBearingFrom', () => {
  expect(() => {
    getLineStringBearingFrom(
      [LOCATION_703_DM],
      LOCATION_703_DM,
    );
  }).toThrow();

  expect(getLineStringBearingFrom(
    [LOCATION_CITY_HALL, [0, 0]],
    LOCATION_703_DM,
  )).toBeNull();
  expect(getLineStringBearingFrom(
    [LOCATION_CITY_HALL, LOCATION_703_DM, [0, 0]],
    LOCATION_703_DM,
  )).toBeNull();

  expect(getLineStringBearingFrom(
    [LOCATION_703_DM, LOCATION_CITY_HALL],
    LOCATION_703_DM,
  )).toBeCloseTo(213.216);
  expect(getLineStringBearingFrom(
    [LOCATION_CITY_HALL, LOCATION_703_DM],
    LOCATION_703_DM,
  )).toBeCloseTo(213.216);
});

test('GeometryUtils.getLineStringBearingFrom [approximate match]', () => {
  const lineString = [
    [
      -79.3359803989999,
      43.709390178,
    ],
    [
      -79.335919975,
      43.7094149070001,
    ],
    [
      -79.3358796589999,
      43.7094325910001,
    ],
    [
      -79.335801433,
      43.709473443,
    ],
    [
      -79.335702053,
      43.7095227620001,
    ],
    [
      -79.3355950769999,
      43.709577444,
    ],
    [
      -79.33549221,
      43.7096263620001,
    ],
    [
      -79.335399874,
      43.7096728550001,
    ],
    [
      -79.335307886,
      43.7097277020001,
    ],
    [
      -79.335210171,
      43.709776483,
    ],
    [
      -79.3350937769999,
      43.7098267490001,
    ],
    [
      -79.334920864,
      43.7098848260001,
    ],
    [
      -79.334817565,
      43.7099154060001,
    ],
    [
      -79.334724076,
      43.709943642,
    ],
    [
      -79.334592535,
      43.7099694550001,
    ],
    [
      -79.3344773219999,
      43.709987416,
    ],
    [
      -79.3343949809999,
      43.7099964500001,
    ],
  ];
  const point = [
    -79.334394981,
    43.70999645,
  ];
  expect(getLineStringBearingFrom(lineString, point)).toBeCloseTo(261.369);
});

test('GeometryUtils.getLineStringMidpoint', () => {
  expect(getLineStringMidpoint([[0, 0], [1, 1]])).toEqual([0.5, 0.5]);
  expect(getLineStringMidpoint([[0, 0], [1, 1], [2, 2]])).toEqual([1, 1]);
});
