/* eslint-disable camelcase */
import path from 'path';

import StudyDAO from '@/lib/db/StudyDAO';
import StudyDataDAO from '@/lib/db/StudyDataDAO';
import { loadJsonSync } from '@/lib/test/TestDataLoader';

const countData_4_1415698 = loadJsonSync(
  path.resolve(__dirname, './data/countData_4_1415698.json'),
);
const countData_5_26177 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_26177.json'),
);

test('StudyDataDAO', async () => {
  // TMC
  let study = await StudyDAO.byCategoryAndCountGroup(5, 26177);
  let result = await StudyDataDAO.byStudy(study);
  let countData = countData_5_26177.map(({ t, data }) => ({ t, data }));
  expect(result.studyData).toEqual(new Map([
    [26177, countData],
  ]));

  // non-TMC, speed-related
  study = await StudyDAO.byCategoryAndCountGroup(4, 1415698);
  result = await StudyDataDAO.byStudy(study);
  countData = countData_4_1415698.map(({ t, data }) => ({ t, data }));
  expect(result.studyData).toEqual(new Map([
    [1415698, countData],
  ]));
});
