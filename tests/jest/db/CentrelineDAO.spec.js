import { CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

afterAll(() => {
  db.$pool.end();
});

test('CentrelineDAO.byFeature', async () => {
  // intersection
  let feature = { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION };
  let result = await CentrelineDAO.byFeature(feature);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toEqual(30000549);
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
});

function expectFeaturesResults(results, expected) {
  expect(results.length).toBe(expected.length);
  expected.forEach(({ centrelineId, centrelineType }, i) => {
    const result = results[i];
    expect(result.centrelineId).toBe(centrelineId);
    expect(result.centrelineType).toBe(centrelineType);
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
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
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
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, query);

  // intersection + segment
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byFeatures(query);
  expectFeaturesResults(results, query);
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
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, 111569);
  expect(result).toHaveLength(2);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.INTERSECTION);
  });

  // invalid ID and type
  await expect(
    CentrelineDAO.featuresIncidentTo(-1, -1),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // invalid ID, valid type
  await expect(
    CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, -1),
  ).resolves.toEqual([]);
});
