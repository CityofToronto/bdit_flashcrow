import Joi from '@/lib/model/Joi';
import CollisionFilters from '@/lib/model/CollisionFilters';
import StudyFilters from '@/lib/model/StudyFilters';
import StudyRequestFilters from '@/lib/model/StudyRequestFilters';
import {
  generateFilters,
  generateFiltersStudyRequest,
} from '@/lib/test/random/FilterGenerator';

test('FilterGenerator.generateFiltersCollision [fuzz test]', async () => {
  for (let i = 0; i < 10; i++) {
    const { filtersCollision, filtersCommon } = generateFilters();
    const collisionQuery = { ...filtersCollision, ...filtersCommon };
    /* eslint-disable-next-line no-await-in-loop */
    await expect(
      Joi.object().keys(CollisionFilters).validateAsync(collisionQuery),
    ).resolves.toEqual(collisionQuery);
  }
});

test('FilterGenerator.generateFiltersStudy [fuzz test]', async () => {
  for (let i = 0; i < 10; i++) {
    const { filtersCommon, filtersStudy } = generateFilters();
    const studyQuery = { ...filtersCommon, ...filtersStudy };
    /* eslint-disable-next-line no-await-in-loop */
    await expect(
      Joi.object().keys(StudyFilters).validateAsync(studyQuery),
    ).resolves.toEqual(studyQuery);
  }
});

test('FilterGenerator.generateFiltersStudyRequest [fuzz test]', async () => {
  for (let i = 0; i < 10; i++) {
    const filtersStudyRequest = generateFiltersStudyRequest();
    /* eslint-disable-next-line no-await-in-loop */
    await expect(
      Joi.object().keys(StudyRequestFilters).validateAsync(filtersStudyRequest),
    ).resolves.toEqual(filtersStudyRequest);
  }
});
