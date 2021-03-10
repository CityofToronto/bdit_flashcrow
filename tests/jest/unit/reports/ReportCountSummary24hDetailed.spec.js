/* eslint-disable camelcase */
import path from 'path';

import { CardinalDirection } from '@/lib/Constants';
import ReportCountSummary24hDetailed from '@/lib/reports/ReportCountSummary24hDetailed';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283.json'),
);

test('ReportCountSummary24hDetailed#transformData [empty dataset]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour detailed report
   * works in this case.
   */
  const { arteries, counts, study } = setup_4_2156283();
  const studyData = new Map([[17, []]]);
  let transformedData = reportInstance.transformData(study, { arteries, counts, studyData });
  expect(transformedData).toHaveLength(1);
  const { date, direction, volumeByBucket } = transformedData[0];
  expect(date.equals(study.date)).toBe(true);
  expect(direction).toBe(CardinalDirection.NORTH);
  transformedData = volumeByBucket;

  const expectedData = transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283.map(
    ({ t }) => ({ t, count: 0 }),
  );
  expect(transformedData).toEqual(expectedData);
});

test('ReportCountSummary24hDetailed#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour detailed report
   * works in this case.
   */
  const {
    arteries,
    counts,
    study,
    studyData,
  } = setup_4_2156283();
  let transformedData = reportInstance.transformData(study, { arteries, counts, studyData });
  expect(transformedData).toHaveLength(1);
  const { date, direction, volumeByBucket } = transformedData[0];
  expect(date.equals(study.date)).toBe(true);
  expect(direction).toBe(CardinalDirection.NORTH);
  transformedData = volumeByBucket;

  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283);
});

test('ReportCountSummary24hDetailed#generateCsv [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

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
