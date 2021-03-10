/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_24H_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_4_2156283_empty = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283_empty.json'),
);

test('ReportCountSummary24h.peak', () => {
  const volumeByBucket = [3, 5, 10, 15, 6, 2, 1, 5, 14, 0];

  expect(ReportCountSummary24h.peak(volumeByBucket, 0, 4, 2)).toEqual({
    indexStart: 2,
    indexEnd: 4,
    sum: 25,
  });

  expect(ReportCountSummary24h.peak(volumeByBucket, 4, 7, 2)).toEqual({
    indexStart: 4,
    indexEnd: 6,
    sum: 8,
  });

  expect(ReportCountSummary24h.peak(volumeByBucket, 6, 10, 2)).toEqual({
    indexStart: 7,
    indexEnd: 9,
    sum: 19,
  });
});

test('ReportCountSummary24h.timeRange', () => {
  const count = {
    date: DateTime.fromObject({ year: 2000, month: 1, day: 1 }),
  };

  expect(ReportCountSummary24h.timeRange(count, 0, 4)).toEqual({
    start: DateTime.fromObject({
      year: 2000,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
    }),
    end: DateTime.fromObject({
      year: 2000,
      month: 1,
      day: 1,
      hour: 1,
      minute: 0,
    }),
  });

  expect(ReportCountSummary24h.timeRange(count, 13, 22)).toEqual({
    start: DateTime.fromObject({
      year: 2000,
      month: 1,
      day: 1,
      hour: 3,
      minute: 15,
    }),
    end: DateTime.fromObject({
      year: 2000,
      month: 1,
      day: 1,
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
