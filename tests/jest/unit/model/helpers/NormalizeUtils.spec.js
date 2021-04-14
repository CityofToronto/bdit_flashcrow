import { InvalidCollisionQueryError } from '@/lib/error/MoveErrors';
import { normalizeCollisionQuery } from '@/lib/model/helpers/NormalizeUtils';
import { generateFilters } from '@/lib/test/random/FilterGenerator';
import DateTime from '@/lib/time/DateTime';

test('NormalizeUtils.normalizeCollisionQuery [date range]', () => {
  let collisionQuery = {
    dateRangeEnd: null,
    dateRangeStart: DateTime.local(),
    hoursOfDayStart: 0,
    hoursOfDayEnd: 24,
  };
  let collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
  expect(collisionQueryNormalized.dateRange).toBeNull();

  collisionQuery = {
    dateRangeEnd: DateTime.local(),
    dateRangeStart: null,
    hoursOfDayStart: 0,
    hoursOfDayEnd: 24,
  };
  collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
  expect(collisionQueryNormalized.dateRange).toBeNull();

  collisionQuery = {
    dateRangeEnd: DateTime.local(),
    dateRangeStart: DateTime.local().plus({ days: 1 }),
    hoursOfDayStart: 0,
    hoursOfDayEnd: 24,
  };
  expect(() => {
    normalizeCollisionQuery(collisionQuery);
  }).toThrow(InvalidCollisionQueryError);
});

test('NormalizeUtils.normalizeCollisionQuery [hours of day range]', () => {
  let collisionQuery = {
    dateRangeEnd: null,
    dateRangeStart: null,
    hoursOfDayStart: null,
    hoursOfDayEnd: 24,
  };
  let collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
  expect(collisionQueryNormalized.hoursOfDay).toBeNull();

  collisionQuery = {
    dateRangeEnd: null,
    dateRangeStart: null,
    hoursOfDayStart: 0,
    hoursOfDayEnd: null,
  };
  collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
  expect(collisionQueryNormalized.hoursOfDay).toBeNull();

  collisionQuery = {
    dateRangeEnd: null,
    dateRangeStart: null,
    hoursOfDayStart: 16,
    hoursOfDayEnd: 14,
  };
  expect(() => {
    normalizeCollisionQuery(collisionQuery);
  }).toThrow(InvalidCollisionQueryError);
});

test('NormalizeUtils.normalizeCollisionQuery [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const { filtersCollision, filtersCommon } = generateFilters();
    const collisionQuery = { ...filtersCollision, ...filtersCommon };
    const collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
    expect(collisionQueryNormalized).not.toHaveProperty('dateRangeEnd');
    expect(collisionQueryNormalized).not.toHaveProperty('dateRangeStart');
    expect(collisionQueryNormalized).toHaveProperty('dateRange');
    expect(collisionQueryNormalized).not.toHaveProperty('hoursOfDayEnd');
    expect(collisionQueryNormalized).not.toHaveProperty('hoursOfDayStart');
    expect(collisionQueryNormalized).toHaveProperty('hoursOfDay');
  }
});
