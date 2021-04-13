/* eslint-disable camelcase */
import path from 'path';

import { StudyHours } from '@/lib/Constants';
import ReportPeakHourFactor from '@/lib/reports/ReportPeakHourFactor';
import { toBeWithinTolerance } from '@/lib/test/ExpectMatchers';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateTmc,
  generateTmc14Hour,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
import { setup_5_36781 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_PEAK_HOUR_FACTOR_5_36781 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_PEAK_HOUR_FACTOR_5_36781.json'),
);
const transformedData_PEAK_HOUR_FACTOR_5_36781_empty = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_PEAK_HOUR_FACTOR_5_36781_empty.json'),
);

expect.extend({
  toBeWithinTolerance,
});

function expectPeakHourFactorsMatch(actual, expected) {
  if (expected.timeRange === null) {
    expect(actual.timeRange).toBeNull();
  } else {
    expect(actual.timeRange.start.toString()).toEqual(expected.timeRange.start.toString());
    expect(actual.timeRange.end.toString()).toEqual(expected.timeRange.end.toString());
  }
  Object.keys(expected.movement).forEach((key) => {
    expect(actual.movement[key]).toBeWithinTolerance(expected.movement[key], 0.001);
  });
  Object.keys(expected.direction).forEach((key) => {
    expect(actual.direction[key]).toBeWithinTolerance(expected.direction[key], 0.001);
  });
  expect(actual.total).toBeWithinTolerance(expected.total, 0.001);
}

test('ReportPeakHourFactor#transformData [empty data]', () => {
  const reportInstance = new ReportPeakHourFactor();

  const { count, counts } = setup_5_36781();
  const studyData = new Map([[1, []]]);
  const transformedData = reportInstance.transformData(count, { counts, studyData });
  const { date, hours, px } = transformedData;
  expect(date.equals(count.date)).toBe(true);
  expect(hours).toBe(StudyHours.SCHOOL);
  expect(px).toBe(1390);

  const { amPeak, pmPeak } = transformedData_PEAK_HOUR_FACTOR_5_36781_empty;
  expectPeakHourFactorsMatch(transformedData.amPeak, amPeak);
  expectPeakHourFactorsMatch(transformedData.pmPeak, pmPeak);
});

test('ReportPeakHourFactor#transformData [fuzz test, TMC]', () => {
  const reportInstance = new ReportPeakHourFactor();

  const { count, counts } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateTmc();
    const studyData = new Map([[1, countData]]);
    expect(() => {
      reportInstance.transformData(count, { counts, studyData });
    }).not.toThrow();
  }
});

test('ReportPeakHourFactor#transformData [fuzz test, 14-hour TMC]', () => {
  const reportInstance = new ReportPeakHourFactor();

  const { count, counts } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateTmc14Hour();
    const studyData = new Map([[1, countData]]);
    expect(() => {
      reportInstance.transformData(count, { counts, studyData });
    }).not.toThrow();
  }
});

test('ReportPeakHourFactor#transformData [fuzz test, TMC with missing]', () => {
  const reportInstance = new ReportPeakHourFactor();

  const { count, counts } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateWithMissing(generateTmc());
    const studyData = new Map([[1, countData]]);
    expect(() => {
      reportInstance.transformData(count, { counts, studyData });
    }).not.toThrow();
  }
});

test('ReportPeakHourFactor#transformData [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportPeakHourFactor();

  const { count, counts, studyData } = setup_5_36781();
  const transformedData = reportInstance.transformData(count, { counts, studyData });
  const { date, hours, px } = transformedData;
  expect(date.equals(count.date)).toBe(true);
  expect(hours).toBe(StudyHours.SCHOOL);
  expect(px).toBe(1390);

  const { amPeak, pmPeak } = transformedData_PEAK_HOUR_FACTOR_5_36781;
  expectPeakHourFactorsMatch(transformedData.amPeak, amPeak);
  expectPeakHourFactorsMatch(transformedData.pmPeak, pmPeak);
});

test('ReportPeakHourFactor#generateCsv [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportPeakHourFactor();

  const { count, counts, studyData } = setup_5_36781();
  const transformedData = reportInstance.transformData(count, { counts, studyData });
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).not.toThrow();
});
