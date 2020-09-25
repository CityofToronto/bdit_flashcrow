import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CollisionDAO from '@/lib/db/CollisionDAO';
import DateTime from '@/lib/time/DateTime';

afterAll(() => {
  db.$pool.end();
});

test('CollisionDAO.byCollisionId', async () => {
  // invalid ID
  let result = await CollisionDAO.byCollisionId(-1);
  expect(result).toBeNull();

  result = await CollisionDAO.byCollisionId(1040350);
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
    emphasisAreas: null,
    roadSurfaceConditions: null,
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
    emphasisAreas: null,
    roadSurfaceConditions: null,
  };
  result = await CollisionDAO.byCentreline(features, collisionQuery);
  expect(result).toHaveLength(27);
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
    emphasisAreas: null,
    roadSurfaceConditions: null,
  };
  let result = await CollisionDAO.byCentrelineSummary(features, collisionQuery);
  expect(result).toEqual({ amount: 31, ksi: 0, validated: 26 });

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummary(features, collisionQuery);
  expect(result).toEqual({ amount: 27, ksi: 1, validated: 16 });

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummary(features, collisionQuery);
  expect(result).toEqual({ amount: 58, ksi: 1, validated: 42 });
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
    emphasisAreas: null,
    roadSurfaceConditions: null,
  };
  let result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([{ amount: 31, ksi: 0, validated: 26 }]);

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([{ amount: 27, ksi: 1, validated: 16 }]);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([
    { amount: 31, ksi: 0, validated: 26 },
    { amount: 27, ksi: 1, validated: 16 },
  ]);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  result = await CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  expect(result).toEqual([
    { amount: 31, ksi: 0, validated: 26 },
    { amount: 27, ksi: 1, validated: 16 },
    { amount: 31, ksi: 0, validated: 26 },
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
  expect(result).toBe(188);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  result = await CollisionDAO.byCentrelineTotal(features);
  expect(result).toBe(400);
});
