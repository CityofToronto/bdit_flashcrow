import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

afterAll(() => {
  db.$pool.end();
});

test('CentrelineDAO.byFeature', async () => {
  // intersection
  let feature = { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION };
  let result = await CentrelineDAO.byFeature(feature);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toEqual(13441579);
  expect(result.centrelineType).toEqual(CentrelineType.INTERSECTION);

  // segment
  feature = { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT };
  result = await CentrelineDAO.byFeature(feature);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toEqual(111569);
  expect(result.centrelineType).toEqual(CentrelineType.SEGMENT);

  // invalid ID and type
  feature = { centrelineId: -1, centrelineType: -1 };
  await expect(
    CentrelineDAO.byFeature(feature),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // invalid ID, valid type
  feature = { centrelineId: -1, centrelineType: CentrelineType.SEGMENT };
  await expect(
    CentrelineDAO.byFeature(feature),
  ).resolves.toBeNull();

  // valid but non-existent ID, intersection
  feature = { centrelineId: 1, centrelineType: CentrelineType.INTERSECTION };
  result = await CentrelineDAO.byFeature(feature);
  expect(result).toBeNull();

  // valid but non-existent ID, segment
  feature = { centrelineId: 1, centrelineType: CentrelineType.SEGMENT };
  result = await CentrelineDAO.byFeature(feature);
  expect(result).toBeNull();
});

function expectFeaturesResults(results, expected) {
  expect(results.length).toBe(expected.length);
  expected.forEach((location, i) => {
    const result = results[i];
    if (location === null) {
      expect(result).toBeNull();
    } else {
      const { centrelineId, centrelineType } = location;
      expect(result.centrelineId).toBe(centrelineId);
      expect(result.centrelineType).toBe(centrelineType);
    }
  });
}

test('CentrelineDAO.byFeatures', async () => {
  // empty
  let query = [];
  let results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, query);

  // invalid
  query = [
    { centrelineId: -1, centrelineType: -1 },
  ];
  expect(CentrelineDAO.byFeatures(query)).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // single valid intersection
  query = [
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, query);

  // single valid segment
  query = [
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, query);

  // duplicate value
  query = [
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, query);

  // intersection + segment
  query = [
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, query);

  // existing intersection + non-existing segment
  query = [
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 1, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, [query[0], null]);

  // non-existing intersection + existing segment
  query = [
    { centrelineId: 1, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, [null, query[1]]);
});

test('CentrelineDAO.featuresIncidentTo [invalid]', async () => {
  // invalid ID and type
  await expect(
    CentrelineDAO.featuresIncidentTo(-1, -1),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // invalid ID, valid type
  await expect(
    CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, -1),
  ).resolves.toEqual([]);

  // invalid type, valid ID
  await expect(
    CentrelineDAO.featuresIncidentTo(-1, 111569),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // non-existent intersection
  let result = await CentrelineDAO.featuresIncidentTo(CentrelineType.INTERSECTION, 1);
  expect(result).toHaveLength(0);

  // non-existent segment
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, 1);
  expect(result).toHaveLength(0);
});

test('CentrelineDAO.featuresIncidentTo', async () => {
  // 4-way intersection
  let result = await CentrelineDAO.featuresIncidentTo(CentrelineType.INTERSECTION, 13463436);
  expect(result).toHaveLength(4);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.SEGMENT);
  });

  // 3-way intersection
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.INTERSECTION, 13459232);
  expect(result).toHaveLength(3);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.SEGMENT);
  });

  // 5-way intersection
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.INTERSECTION, 13463551);
  expect(result).toHaveLength(5);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.SEGMENT);
  });

  // segment
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, 1146279);
  expect(result).toHaveLength(2);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.INTERSECTION);
  });

  // cul-de-sac segment
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, 111569);
  expect(result.length).toBeGreaterThanOrEqual(1);
  expect(result.length).toBeLessThanOrEqual(2);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.INTERSECTION);
  });
});
