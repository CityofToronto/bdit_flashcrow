import {
  getStudyRequestFilters,
  getStudyRequestSort,
} from '@/lib/db/filters/StudyRequestFiltersSql';
import { generateFiltersStudyRequest } from '@/lib/test/random/FilterGenerator';

test('StudyRequestFiltersSql.getStudyRequestFilters [fuzz test]', () => {
  for (let i = 0; i < 25; i++) {
    const filtersStudyRequest = generateFiltersStudyRequest();

    // ensure structure
    const user = { id: 42 };
    const { filters, params } = getStudyRequestFilters(filtersStudyRequest, user);
    expect(filters).toBeInstanceOf(Array);
    expect(params).toBeInstanceOf(Object);

    // ensure filters actually have corresponding parameter values
    filters.forEach((filter) => {
      const filterParamMatches = Array.from(filter.matchAll(/\$\(([^)]*)\)/g));
      filterParamMatches.forEach((filterParamMatch) => {
        const [filterParam] = filterParamMatch[1].split(':');
        expect(params).toHaveProperty(filterParam);
      });
    });
  }
});

test('StudyRequestFiltersSql.getStudyRequestSort [fuzz test]', () => {
  for (let i = 0; i < 25; i++) {
    const filtersStudyRequest = generateFiltersStudyRequest();

    // ensure structure
    const filter = getStudyRequestSort(filtersStudyRequest);
    expect(typeof filter).toBe('string');
  }
});
