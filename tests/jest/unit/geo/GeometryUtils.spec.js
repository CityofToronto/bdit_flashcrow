import { CardinalDirection } from '@/lib/Constants';
import {
  getBearingDifference,
  getDirectionCandidatesFrom,
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
  expect(getLineStringBearingFrom(
    [LOCATION_703_DM, LOCATION_CITY_HALL],
    LOCATION_703_DM,
  )).toBeCloseTo(213.216);
  expect(getLineStringBearingFrom(
    [LOCATION_CITY_HALL, LOCATION_703_DM],
    LOCATION_703_DM,
  )).toBeCloseTo(213.216);
});

test('GeometryUtils.getLineStringMidpoint', () => {
  expect(getLineStringMidpoint([[0, 0], [1, 1]])).toEqual([0.5, 0.5]);
  expect(getLineStringMidpoint([[0, 0], [1, 1], [2, 2]])).toEqual([1, 1]);
});
