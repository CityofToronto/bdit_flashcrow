import { centrelineKey, CentrelineType } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

test('CentrelineDAO.byIdAndType()', async () => {
  // intersection
  let result = await CentrelineDAO.byIdAndType(30000549, CentrelineType.INTERSECTION);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toEqual(30000549);
  expect(result.centrelineType).toEqual(CentrelineType.INTERSECTION);

  // segment
  result = await CentrelineDAO.byIdAndType(111569, CentrelineType.SEGMENT);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toEqual(111569);
  expect(result.centrelineType).toEqual(CentrelineType.SEGMENT);

  // invalid ID and type
  await expect(
    CentrelineDAO.byIdAndType(-1, -1),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // invalid ID, valid type
  await expect(
    CentrelineDAO.byIdAndType(-1, CentrelineType.SEGMENT),
  ).resolves.toBeNull();
});

function expectIdsAndTypesResult(results, { centrelineId, centrelineType }) {
  const key = centrelineKey(centrelineType, centrelineId);
  expect(results.has(key)).toBe(true);
  const result = results.get(key);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toBe(centrelineId);
  expect(result.centrelineType).toBe(centrelineType);
}

function expectIdsAndTypesResults(results, expected) {
  expect(results.size).toBe(expected.length);
  expected.forEach((expectedResult) => {
    expectIdsAndTypesResult(results, expectedResult);
  });
}

test('CentrelineDAO.byIdsAndTypes()', async () => {
  // empty
  let query = [];
  let results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);

  // invalid
  query = [
    { centrelineId: -1, centrelineType: -1 },
  ];
  expect(CentrelineDAO.byIdsAndTypes(query)).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // single valid intersection
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);

  // single valid segment
  query = [
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);

  // duplicate value
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, [query[0]]);

  // intersection + segment
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);
});

function expectSuggestionsContain(result, centrelineId) {
  const suggestedIds = result.map(({ centrelineId: suggestedId }) => suggestedId);
  expect(suggestedIds).toContain(centrelineId);
}

test('CentrelineDAO.intersectionSuggestions', async () => {
  // full query should match
  let result = await CentrelineDAO.intersectionSuggestions('Danforth and Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial query should match
  result = await CentrelineDAO.intersectionSuggestions('Danforth and Mai', 3);
  expectSuggestionsContain(result, 13460034);

  // either term can be prefixed
  result = await CentrelineDAO.intersectionSuggestions('Dan and Main', 3);
  expectSuggestionsContain(result, 13460034);

  // full query with minor typo should match
  result = await CentrelineDAO.intersectionSuggestions('Damforth and Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial query with minor typo should match
  result = await CentrelineDAO.intersectionSuggestions('Damforth and Mai', 3);
  expectSuggestionsContain(result, 13460034);

  // full queries: 'and' is optional
  result = await CentrelineDAO.intersectionSuggestions('Danforth Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial queries: 'and' is optional
  result = await CentrelineDAO.intersectionSuggestions('Danforth Mai', 3);
  expectSuggestionsContain(result, 13460034);

  // full queries: punctuation ignored
  result = await CentrelineDAO.intersectionSuggestions('Danforth & Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial queries: punctuation ignored
  result = await CentrelineDAO.intersectionSuggestions('Danforth / Mai', 3);
  expectSuggestionsContain(result, 13460034);
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
