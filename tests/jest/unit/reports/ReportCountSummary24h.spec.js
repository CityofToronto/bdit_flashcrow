/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import { sumByTime } from '@/lib/reports/time/ReportTimeUtils';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_24H_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_4_2156283_empty = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283_empty.json'),
);

test('ReportCountSummary24h.timeRange', () => {
  const { studyData } = setup_4_2156283();
  const countData = studyData.get(17);
  const totaledData = sumByTime(countData);

  expect(ReportCountSummary24h.timeRange(totaledData, { lo: 0, hi: 4 })).toEqual({
    start: DateTime.fromObject({
      year: 2019,
      month: 3,
      day: 7,
      hour: 0,
      minute: 0,
    }),
    end: DateTime.fromObject({
      year: 2019,
      month: 3,
      day: 7,
      hour: 1,
      minute: 0,
    }),
  });

  expect(ReportCountSummary24h.timeRange(totaledData, { lo: 13, hi: 22 })).toEqual({
    start: DateTime.fromObject({
      year: 2019,
      month: 3,
      day: 7,
      hour: 3,
      minute: 15,
    }),
    end: DateTime.fromObject({
      year: 2019,
      month: 3,
      day: 7,
      hour: 5,
      minute: 30,
    }),
  });
});

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
