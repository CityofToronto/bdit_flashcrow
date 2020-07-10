import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CategoryDAO from '@/lib/db/CategoryDAO';
import Category from '@/lib/model/Category';

afterAll(() => {
  db.$pool.end();
});

test('CategoryDAO', async () => {
  expect(CategoryDAO.isInited()).toBe(false);

  let category = await CategoryDAO.byId(1);
  expect(category.id).toBe(1);
  expect(category.studyType).toBe(StudyType.ATR_VOLUME);
  await expect(
    Category.read.validateAsync(category),
  ).resolves.toEqual(category);
  expect(CategoryDAO.isInited()).toBe(true);

  category = await CategoryDAO.byId(-1);
  expect(category).toBeUndefined();

  await expect(CategoryDAO.all()).resolves.toBeInstanceOf(Map);
});
