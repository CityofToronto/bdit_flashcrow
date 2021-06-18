import { CentrelineType, LocationSearchType } from '@/lib/Constants';
import db from '@/lib/db/db';
import LocationSearchDAO from '@/lib/db/LocationSearchDAO';

afterAll(() => {
  db.$pool.end();
});

function expectSuggestionsContain(result, centrelineType, centrelineId) {
  const match = result.find(({
    centrelineType: suggestedType,
    centrelineId: suggestedId,
  }) => suggestedType === centrelineType && suggestedId === centrelineId);
  expect(match).not.toBeUndefined();
}

test('LocationSearchDAO.arterySuggestions', async () => {
  let result = await LocationSearchDAO.arterySuggestions(-1);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.arterySuggestions(1234);
  expectSuggestionsContain(result, CentrelineType.SEGMENT, 908372);
});

test('LocationSearchDAO.getSuggestions', async () => {
  let result = await LocationSearchDAO.getSuggestions(null, 'Danforth and Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  result = await LocationSearchDAO.getSuggestions(null, 'Damforth and Mai', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  result = await LocationSearchDAO.getSuggestions(null, 'invalidTerm:', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions(null, 'px:invalid', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions(null, 'artery:123456789', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions(null, 'artery:1234', 3);
  expectSuggestionsContain(result, CentrelineType.SEGMENT, 908372);

  result = await LocationSearchDAO.getSuggestions(null, 'a:1234', 3);
  expectSuggestionsContain(result, CentrelineType.SEGMENT, 908372);

  result = await LocationSearchDAO.getSuggestions(null, 'px:123456789', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions(null, 'px:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions(null, 'signal:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions(null, 'tcs:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions(null, 'p:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions(null, 'sig:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions(null, 'tc:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions([LocationSearchType.ARTERY], 'artery:1234', 3);
  expectSuggestionsContain(result, CentrelineType.SEGMENT, 908372);

  result = await LocationSearchDAO.getSuggestions([LocationSearchType.SIGNAL], 'artery:1234', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions([LocationSearchType.ARTERY], 'signal:1234', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions([LocationSearchType.SIGNAL], 'signal:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions(
    [LocationSearchType.INTERSECTION],
    'Danforth and Main',
    3,
  );
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);
});

test('LocationSearchDAO.intersectionSuggestions', async () => {
  // full query should match
  let result = await LocationSearchDAO.intersectionSuggestions('Danforth and Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // partial query should match
  result = await LocationSearchDAO.intersectionSuggestions('Danforth and Mai', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // either term can be prefixed
  result = await LocationSearchDAO.intersectionSuggestions('Danfo and Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // full query with minor typo should match
  result = await LocationSearchDAO.intersectionSuggestions('Damforth and Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // partial query with minor typo should match
  result = await LocationSearchDAO.intersectionSuggestions('Damforth and Mai', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // full queries: 'and' is optional
  result = await LocationSearchDAO.intersectionSuggestions('Danforth Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // partial queries: 'and' is optional
  result = await LocationSearchDAO.intersectionSuggestions('Danforth Mai', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // full queries: punctuation ignored
  result = await LocationSearchDAO.intersectionSuggestions('Danforth & Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // partial queries: punctuation ignored
  result = await LocationSearchDAO.intersectionSuggestions('Danforth / Mai', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);
});

test('LocationSearchDAO.intersectionSuggestions [empty / stopwords]', async () => {
  // empty query: returns empty result list
  let result = await LocationSearchDAO.intersectionSuggestions('', 3);
  expect(result).toEqual([]);

  // only stopwords: returns empty result list
  result = await LocationSearchDAO.intersectionSuggestions('and the', 3);
  expect(result).toEqual([]);
});

test('LocationSearchDAO.trafficSignalSuggestions', async () => {
  let result = await LocationSearchDAO.trafficSignalSuggestions(-1);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.trafficSignalSuggestions(1234);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);
});
