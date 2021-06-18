/* eslint-disable camelcase */
import path from 'path';

import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyDAO from '@/lib/db/StudyDAO';
import StudyDataDAO from '@/lib/db/StudyDataDAO';
import { loadJsonSync } from '@/lib/test/TestDataLoader';

const countData_4_1415698 = loadJsonSync(
  path.resolve(__dirname, './data/countData_4_1415698.json'),
);
const countData_5_26177 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_26177.json'),
);

afterAll(() => {
  db.$pool.end();
});

test('StudyDataDAO [TMC]', async () => {
  // TMC
  const study = await StudyDAO.byStudyTypeAndCountGroup(StudyType.TMC, 26177);
  const result = await StudyDataDAO.byStudy(study);
  const countData = countData_5_26177.map(({ t, data }) => ({
    t: t.minus({ minutes: 15 }),
    data,
  }));
  expect(result.studyData).toEqual(new Map([
    [26177, countData],
  ]));
});

test('StudyDataDAO [ATR]', async () => {
  // non-TMC, speed-related
  const study = await StudyDAO.byStudyTypeAndCountGroup(StudyType.ATR_SPEED_VOLUME, 1415698);
  const result = await StudyDataDAO.byStudy(study);
  const countData = countData_4_1415698.map(({ t, data }) => ({ t, data }));
  expect(result.studyData).toEqual(new Map([
    [1415698, countData],
  ]));
});
