import Joi from '@/lib/model/Joi';
import StudyRequestFilters from '@/lib/model/StudyRequestFilters';
import { generateFiltersStudyRequest } from '@/lib/test/random/FilterGenerator';

test('FilterGenerator.generateFiltersStudyRequest [fuzz test]', async () => {
  for (let i = 0; i < 10; i++) {
    const filtersStudyRequest = generateFiltersStudyRequest();
    /* eslint-disable-next-line no-await-in-loop */
    await expect(
      Joi.object().keys(StudyRequestFilters).validateAsync(filtersStudyRequest),
    ).resolves.toEqual(filtersStudyRequest);
  }
});
