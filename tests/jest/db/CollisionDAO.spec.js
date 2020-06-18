import { CentrelineType } from '@/lib/Constants';
import CollisionDAO from '@/lib/db/CollisionDAO';
import DateTime from '@/lib/time/DateTime';

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

  let result = await CollisionDAO.byCentreline({
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toHaveLength(31);

  result = await CollisionDAO.byCentreline({
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toHaveLength(27);
});

test('CollisionDAO.byCentrelineSummary', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let result = await CollisionDAO.byCentrelineSummary({
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toEqual({ amount: 31, ksi: 0, validated: 26 });

  result = await CollisionDAO.byCentrelineSummary({
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toEqual({ amount: 27, ksi: 1, validated: 16 });
});

test('CollisionDAO.byCentrelineTotal', async () => {
  let result = await CollisionDAO.byCentrelineTotal(CentrelineType.SEGMENT, 1142194);
  expect(result).toBe(212);

  result = await CollisionDAO.byCentrelineTotal(CentrelineType.INTERSECTION, 13465434);
  expect(result).toBe(188);
});
