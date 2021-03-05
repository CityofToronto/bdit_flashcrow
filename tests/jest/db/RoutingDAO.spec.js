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
  result = await RoutingDAO.routeIntersections(intersectionTo, intersectionFrom);
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

test('RoutingDAO.routeFeatures', async () => {
  // route from non-existent intersection
  let featureFrom = { centrelineId: -1, centrelineType: CentrelineType.INTERSECTION };
  let featureTo = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  let result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toBeNull();

  // route from non-existent midblock
  featureFrom = { centrelineId: -1, centrelineType: CentrelineType.SEGMENT };
  featureTo = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toBeNull();

  // route to non-existent intersection
  featureFrom = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  featureTo = { centrelineId: -1, centrelineType: CentrelineType.SEGMENT };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toBeNull();

  // route to non-existent midblock
  featureFrom = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  featureTo = { centrelineId: -1, centrelineType: CentrelineType.SEGMENT };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toBeNull();

  // route from intersection to itself
  featureFrom = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  featureTo = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({ next: featureTo, route: [] });

  // route from midblock to itself
  featureFrom = { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT };
  featureTo = { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({ next: featureTo, route: [] });

  // route from intersection to incident midblock
  featureFrom = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  featureTo = { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({
    next: { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    route: [featureTo],
  });

  // route from midblock to incident intersection
  featureFrom = { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT };
  featureTo = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({ next: featureTo, route: [featureTo] });

  // route from midblock to midblock with common intersection
  featureFrom = { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT };
  featureTo = { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({
    next: { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    route: [
      { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
      featureTo,
    ],
  });

  // route from intersection to nearby intersection
  featureFrom = { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION };
  featureTo = { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({
    next: featureTo,
    route: [
      { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
      { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
      { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
      featureTo,
    ],
  });

  // route from intersection to nearby midblock
  featureFrom = { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION };
  featureTo = { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({
    next: { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    route: [
      { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
      { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
      { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
      { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
      { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
      { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
      featureTo,
    ],
  });

  // route from midblock to nearby intersection
  featureFrom = { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT };
  featureTo = { centrelineId: 13454752, centrelineType: CentrelineType.INTERSECTION };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({
    next: featureTo,
    route: [
      { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
      { centrelineId: 444715, centrelineType: CentrelineType.SEGMENT },
      featureTo,
    ],
  });

  // route from midblock to nearby midblock
  featureFrom = { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT };
  featureTo = { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT };
  result = await RoutingDAO.routeFeatures(featureFrom, featureTo);
  expect(result).toEqual({
    next: { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    route: [
      { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
      { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
      { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
      featureTo,
    ],
  });
});

test('RoutingDAO.routeCorridor', async () => {
  // length 0
  let features = [];
  let corridor = await RoutingDAO.routeCorridor(features);
  expect(corridor).toEqual([]);

  // length 1
  features = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
  ];
  corridor = await RoutingDAO.routeCorridor(features);
  expect(corridor).toEqual(features);

  // length 2, duplicate point
  features = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
  ];
  corridor = await RoutingDAO.routeCorridor(features);
  expect(corridor).toEqual([features[0]]);

  // length 2, point to nearby midblock
  features = [
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
  ];
  corridor = await RoutingDAO.routeCorridor(features);
  expect(corridor).toEqual([
    features[0],
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    features[1],
  ]);

  // length > 2, Don Mills from Overlea / Gateway to Eglinton in several steps
  features = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13454752, centrelineType: CentrelineType.INTERSECTION },
  ];
  corridor = await RoutingDAO.routeCorridor(features);
  expect(corridor).toEqual([
    features[0],
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    features[1],
    features[2],
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    features[3],
    { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444715, centrelineType: CentrelineType.SEGMENT },
    features[4],
  ]);

  // length > 2, same corridor with duplicates
  features = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13454752, centrelineType: CentrelineType.INTERSECTION },
  ];
  corridor = await RoutingDAO.routeCorridor(features);
  expect(corridor).toEqual([
    features[0],
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    features[1],
    features[3],
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    features[4],
    { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444715, centrelineType: CentrelineType.SEGMENT },
    features[6],
  ]);

  // length > 2, Don Mills from Overlea / Gateway to Eglinton with backtracking
  features = [
    { centrelineId: 13456414, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13454752, centrelineType: CentrelineType.INTERSECTION },
  ];
  corridor = await RoutingDAO.routeCorridor(features);
  expect(corridor).toEqual([
    features[0],
    { centrelineId: 3304786, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    features[1],
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    features[2],
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    features[3],
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    features[4],
    { centrelineId: 13454835, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444715, centrelineType: CentrelineType.SEGMENT },
    features[5],
  ]);
});
