/* eslint-disable camelcase */
import path from 'path';

import { CardinalDirection } from '@/lib/Constants';
import ReportCountSummary24hDetailed from '@/lib/reports/ReportCountSummary24hDetailed';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
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
  const { date, direction, totaledData } = transformedData[0];
  expect(date.equals(study.date)).toBe(true);
  expect(direction).toBe(CardinalDirection.NORTH);
  transformedData = totaledData;
  expect(transformedData).toEqual([]);
});

test('ReportCountSummary24hDetailed#transformData [fuzz test, ATR speed / volume]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

  const { arteries, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrSpeedVolume();
    const studyData = new Map([[17, countData]]);
    expect(() => {
      reportInstance.transformData(study, { arteries, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24hDetailed#transformData [fuzz test, ATR volume]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

  const { arteries, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrVolume();
    const studyData = new Map([[17, countData]]);
    expect(() => {
      reportInstance.transformData(study, { arteries, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24hDetailed#transformData [fuzz test, ATR volume with missing]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

  const { arteries, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateWithMissing(generateAtrVolume());
    const studyData = new Map([[17, countData]]);
    expect(() => {
      reportInstance.transformData(study, { arteries, counts, studyData });
    }).not.toThrow();
  }
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
  const { date, direction, totaledData } = transformedData[0];
  expect(date.equals(study.date)).toBe(true);
  expect(direction).toBe(CardinalDirection.NORTH);
  transformedData = totaledData;

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
