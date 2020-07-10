import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import RoutingDAO from '@/lib/db/RoutingDAO';

afterAll(() => {
  db.$pool.end();
});

test('RoutingDAO.getOtherIntersection', () => {
  expect(RoutingDAO.getOtherIntersection([6, 17], 6)).toEqual(17);
  expect(RoutingDAO.getOtherIntersection([6, 17], 17)).toEqual(6);
  expect(RoutingDAO.getOtherIntersection([42], 42)).toEqual(42);
});

test('RoutingDAO.getRoutableIntersections', async () => {
  let feature = {
    centrelineId: 13452850,
    centrelineType: CentrelineType.INTERSECTION,
  };
  let intersections = await RoutingDAO.getRoutableIntersections(feature);
  expect(intersections).toEqual([13452850]);

  feature = {
    centrelineId: 444525,
    centrelineType: CentrelineType.SEGMENT,
  };
  intersections = await RoutingDAO.getRoutableIntersections(feature);
  expect(intersections).toEqual([13454566, 13454601]);
});

test('RoutingDAO.routeIntersections', async () => {
  // routing with non-existent intersection(s): should return null
  let intersectionFrom = 13456414;
  let intersectionTo = -1;
  let result = await RoutingDAO.routeIntersections(intersectionFrom, intersectionTo);
  expect(result).toBeNull();

  intersectionFrom = -1;
  intersectionTo = 13456414;
  result = await RoutingDAO.routeIntersections(intersectionFrom, intersectionTo);
  expect(result).toBeNull();

  // route to self: should be empty with zero cost
  intersectionFrom = 13456414;
  intersectionTo = 13456414;
  result = await RoutingDAO.routeIntersections(intersectionFrom, intersectionTo);
  expect(result).toEqual({ cost: 0, route: [] });

  // routing to neighbour
  intersectionFrom = 13456414;
  intersectionTo = 13456067;
  result = await RoutingDAO.routeIntersections(intersectionFrom, intersectionTo);
  const { cost } = result;
  expect(cost).toBeGreaterThan(0);
  expect(result.route).toEqual([
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
  ]);

  // reverse route
  intersectionFrom = 13456067;
  intersectionTo = 13456414;
  result = await RoutingDAO.routeIntersections(intersectionFrom, intersectionTo);
  expect(result.cost).toEqual(cost);
  expect(result.route).toEqual([
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
  ]);

  // routing two steps away
  intersectionFrom = 13456414;
  intersectionTo = 13455700;
  result = await RoutingDAO.routeIntersections(intersectionFrom, intersectionTo);
  expect(result.cost).toBeGreaterThan(cost);
  expect(result.route).toEqual([
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
  ]);
});
