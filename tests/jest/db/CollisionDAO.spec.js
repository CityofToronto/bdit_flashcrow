import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CollisionDAO from '@/lib/db/CollisionDAO';
import DateTime from '@/lib/time/DateTime';

afterAll(() => {
  db.$pool.end();
});

test('CollisionDAO.byCollisionId', async () => {
  // invalid ID
  let result = await CollisionDAO.byCollisionId('-1');
  expect(result).toBeNull();

  result = await CollisionDAO.byCollisionId('2012:1288425');
  expect(result).not.toBeNull();
  expect(result.centrelineId).toBe(1142194);
  expect(result.centrelineType).toBe(CentrelineType.SEGMENT);
  expect(result.involved).toHaveLength(2);
});

test('CollisionDAO.byCentreline', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  let collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    drivact: null,
    drivcond: null,
    emphasisAreas: null,
    impactype: null,
    initdir: null,
    manoeuver: null,
    rdsfcond: null,
  };
  let result = await CollisionDAO.byCentreline(features, collisionQuery);
  expect(result).toHaveLength(31);

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    drivact: null,
    drivcond: null,
    emphasisAreas: null,
    impactype: null,
    initdir: null,
    manoeuver: null,
    rdsfcond: null,
  };
  result = await CollisionDAO.byCentreline(features, collisionQuery);
  expect(result).toHaveLength(26);
});

test('CollisionDAO.byCentrelineSummary', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  const collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    drivact: null,
    drivcond: null,
    emphasisAreas: null,
    impactype: null,
    initdir: null,
    manoeuver: null,
    rdsfcond: null,
  };
  let result = await CollisionDAO.byCentrelineSummary(features, collisionQuery);
  expect(result).toEqual({ amount: 31, ksi: 0, validated: 7 });

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummary(features, collisionQuery);
  expect(result).toEqual({ amount: 26, ksi: 1, validated: 14 });

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummary(features, collisionQuery);
  expect(result).toEqual({ amount: 57, ksi: 1, validated: 21 });
});

test('CollisionDAO.byCentrelineSummaryPerLocation', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  const collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    drivact: null,
    drivcond: null,
    emphasisAreas: null,
    impactype: null,
    initdir: null,
    manoeuver: null,
    rdsfcond: null,
  };
  let result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([{ amount: 31, ksi: 0, validated: 7 }]);

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([{ amount: 26, ksi: 1, validated: 14 }]);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([
    { amount: 31, ksi: 0, validated: 7 },
    { amount: 26, ksi: 1, validated: 14 },
  ]);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([
    { amount: 31, ksi: 0, validated: 7 },
    { amount: 26, ksi: 1, validated: 14 },
    { amount: 31, ksi: 0, validated: 7 },
  ]);
});

test('CollisionDAO.byCentrelineTotal', async () => {
  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  let result = await CollisionDAO.byCentrelineTotal(features);
  expect(result).toBeGreaterThanOrEqual(212);

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineTotal(features);
  expect(result).toBeGreaterThanOrEqual(184);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineTotal(features);
  expect(result).toBeGreaterThanOrEqual(400);
});
