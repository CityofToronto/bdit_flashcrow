/* eslint-disable camelcase */
import path from 'path';

import { StudyHours } from '@/lib/Constants';
import Random from '@/lib/Random';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateIndexRange,
  generateTmc,
  generateTmc14Hour,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
import { setup_5_36781 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781.json'),
);

const transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781_empty = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781_empty.json'),
);

test.skip('ReportCountSummaryTurningMovement.sumIndexRange', () => {
  // fuzz test
  for (let i = 0; i < 10; i++) {
    const k = 5;
    const countData = generateTmc();
    const indexRange = generateIndexRange(countData);
    const { lo, hi } = indexRange;
    const sum = ReportCountSummaryTurningMovement.sumIndexRange(countData, indexRange);
    const keysToTest = Random.sample(Array.from(Object.keys(countData[0].data)), k);
    keysToTest.forEach((key) => {
      expect(sum[key]).toBe(
        ArrayStats.sum(
          countData
            .slice(lo, hi)
            .map(({ data }) => data[key]),
        ),
      );
    });
  }
});

test('ReportCountSummaryTurningMovement#transformData [empty dataset]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();

  const { countLocation, counts, study } = setup_5_36781();
  const studyData = new Map([[36781, []]]);
  let transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  const { hours, px, stats } = transformedData;
  expect(hours).toBe(StudyHours.ROUTINE);
  expect(px).toBe(1390);
  transformedData = stats;

  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781_empty);
});

test.skip('ReportCountSummaryTurningMovement#transformData [fuzz test, TMC]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();

  const { countLocation, counts, study } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateTmc();
    const studyData = new Map([[36781, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test.skip('ReportCountSummaryTurningMovement#transformData [fuzz test, 14-hour TMC]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();

  const { countLocation, counts, study } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateTmc14Hour();
    const studyData = new Map([[36781, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test.skip('ReportCountSummaryTurningMovement#transformData [fuzz test, TMC with missing]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();

  const { countLocation, counts, study } = setup_5_36781();
  for (let i = 0; i < 3; i++) {
    const countData = generateWithMissing(generateTmc());
    const studyData = new Map([[36781, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test.skip('ReportCountSummaryTurningMovement#transformData [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();

  /*
   * The original reports round each turning movement, then add the rounded values to get
   * totals.  MOVE, on the other hand, adds before rounding - this causes slight mismatches
   * in those values, so we've slightly altered the test case to match the MOVE output.
   *
   * For each alteration, we double-checked that either a) the change is at most
   * +/- 1 (i.e. a rounding issue), b) the updated value makes sense given the calculation
   * (e.g. a "total" value is the sum of the values it includes), or c) the update is in one
   * of the base values, suggesting that it was in fact incorrect in the legacy report.
   */
  const {
    countLocation,
    counts,
    study,
    studyData,
  } = setup_5_36781();
  let transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  const { hours, px, stats } = transformedData;
  expect(hours).toBe(StudyHours.ROUTINE);
  expect(px).toBe(1390);
  transformedData = stats;

  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781);
});

test('ReportCountSummaryTurningMovement#generateCsv [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();
  const {
    countLocation,
    counts,
    study,
    studyData,
  } = setup_5_36781();
  const transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  expect(() => {
    reportInstance.generateCsv(study, transformedData);
  }).not.toThrow();
});
