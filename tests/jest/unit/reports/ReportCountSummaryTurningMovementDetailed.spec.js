/* eslint-disable camelcase */
import path from 'path';

import { StudyHours } from '@/lib/Constants';
import ReportCountSummaryTurningMovementDetailed
  from '@/lib/reports/ReportCountSummaryTurningMovementDetailed';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateTmc,
  generateTmc14Hour,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
import { setup_5_36781 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781 = loadJsonSync(
  path.resolve(
    __dirname,
    './data/transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781.json',
  ),
);

test('ReportCountSummaryTurningMovementDetailed#transformData [empty dataset]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const { count, counts } = setup_5_36781();
  const studyData = new Map([[1, []]]);
  let transformedData = reportInstance.transformData(count, { counts, studyData });
  const { hours, px, raw } = transformedData;
  expect(hours).toBe(StudyHours.SCHOOL);
  expect(px).toBe(1390);
  transformedData = raw;

  expect(transformedData).toEqual([]);
});

test('ReportCountSummaryTurningMovementDetailed#transformData [fuzz test, TMC]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const { count, counts } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateTmc();
    const studyData = new Map([[1, countData]]);
    expect(() => {
      reportInstance.transformData(count, { counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummaryTurningMovementDetailed#transformData [fuzz test, 14-hour TMC]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const { count, counts } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateTmc14Hour();
    const studyData = new Map([[1, countData]]);
    expect(() => {
      reportInstance.transformData(count, { counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummaryTurningMovementDetailed#transformData [fuzz test, TMC with missing]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const { count, counts } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateWithMissing(generateTmc());
    const studyData = new Map([[1, countData]]);
    expect(() => {
      reportInstance.transformData(count, { counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummaryTurningMovementDetailed#transformData [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const { count, counts, studyData } = setup_5_36781();
  let transformedData = reportInstance.transformData(count, { counts, studyData });
  const { hours, px, raw } = transformedData;
  expect(hours).toBe(StudyHours.SCHOOL);
  expect(px).toBe(1390);
  transformedData = raw;

  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781);
});

test('ReportCountSummaryTurningMovementDetailed#generateCsv [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const { count, counts, studyData } = setup_5_36781();
  const transformedData = reportInstance.transformData(count, { counts, studyData });
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).not.toThrow();
});
