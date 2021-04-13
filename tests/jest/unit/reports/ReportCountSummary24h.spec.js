/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_24H_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_4_2156283_empty = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283_empty.json'),
);

test('ReportCountSummary24h#transformData [empty dataset]', () => {
  const reportInstance = new ReportCountSummary24h();

  const { arteries, counts, study } = setup_4_2156283();
  const studyData = new Map([[17, []]]);
  const transformedData = reportInstance.transformData(study, { arteries, counts, studyData });
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_4_2156283_empty);
});

test('ReportCountSummary24h#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24h();
  const {
    arteries,
    counts,
    study,
    studyData,
  } = setup_4_2156283();
  const transformedData = reportInstance.transformData(study, { arteries, counts, studyData });
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_4_2156283);
});

test('ReportCountSummary24h#generateCsv [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24h();
  const {
    arteries,
    counts,
    study,
    studyData,
  } = setup_4_2156283();
  const transformedData = reportInstance.transformData(study, { arteries, counts, studyData });
  expect(() => {
    reportInstance.generateCsv(study, transformedData);
  }).not.toThrow();
});
