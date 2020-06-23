import { CentrelineType } from '@/lib/Constants';
import LocationSearchDAO from '@/lib/db/LocationSearchDAO';

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
  let result = await LocationSearchDAO.getSuggestions('Danforth and Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  result = await LocationSearchDAO.getSuggestions('Damforth and Mai', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  result = await LocationSearchDAO.getSuggestions('invalidTerm:', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions('px:invalid', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions('artery:123456789', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions('artery:1234', 3);
  expectSuggestionsContain(result, CentrelineType.SEGMENT, 908372);

  result = await LocationSearchDAO.getSuggestions('a:1234', 3);
  expectSuggestionsContain(result, CentrelineType.SEGMENT, 908372);

  result = await LocationSearchDAO.getSuggestions('px:123456789', 3);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.getSuggestions('px:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions('signal:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions('p:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);

  result = await LocationSearchDAO.getSuggestions('sig:1234', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);
});

test('LocationSearchDAO.intersectionSuggestions', async () => {
  // full query should match
  let result = await LocationSearchDAO.intersectionSuggestions('Danforth and Main', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // partial query should match
  result = await LocationSearchDAO.intersectionSuggestions('Danforth and Mai', 3);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13460034);

  // either term can be prefixed
  result = await LocationSearchDAO.intersectionSuggestions('Dan and Main', 3);
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

test('LocationSearchDAO.trafficSignalSuggestions', async () => {
  let result = await LocationSearchDAO.trafficSignalSuggestions(-1);
  expect(result).toEqual([]);

  result = await LocationSearchDAO.trafficSignalSuggestions(1234);
  expectSuggestionsContain(result, CentrelineType.INTERSECTION, 13448866);
});
