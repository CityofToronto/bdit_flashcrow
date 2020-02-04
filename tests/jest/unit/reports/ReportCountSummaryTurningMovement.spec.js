/* eslint-disable camelcase */
import path from 'path';

import ArrayUtils from '@/lib/ArrayUtils';
import { StudyType } from '@/lib/Constants';
import Random from '@/lib/Random';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import { generateTmc } from '@/lib/test/random/CountDataGenerator';
import DateTime from '@/lib/time/DateTime';

const countData_5_36781 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_36781.json'),
);
const transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781.json'),
);

test('ReportCountSummaryTurningMovement.sumIndices', () => {
  // fuzz test
  for (let i = 0; i < 10; i++) {
    const k = 5;
    const countData = generateTmc();
    const indices = Random.sample(ArrayUtils.range(countData.length), k);
    const sum = ReportCountSummaryTurningMovement.sumIndices(countData, indices);
    const keysToTest = Random.sample(Array.from(Object.keys(countData[0].data)), k);
    keysToTest.forEach((key) => {
      expect(sum[key]).toBe(
        ArrayStats.sum(
          ArrayUtils.selectIndices(countData, indices)
            .map(({ data }) => data[key]),
        ),
      );
    });
  }
});

test('ReportCountSummaryTurningMovement#transformData [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();

  const count = {
    date: DateTime.fromSQL('2018-02-27 00:00:00'),
    locationDesc: 'GERRARD ST AT SUMACH ST (PX 1390)',
    type: { studyType: StudyType.TMC },
  };

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
  const transformedData = reportInstance.transformData(count, countData_5_36781);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781);
});

test('ReportCountSummaryTurningMovement#generateCsv [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovement();

  const count = {
    date: DateTime.fromSQL('2018-02-27 00:00:00'),
    locationDesc: 'GERRARD ST AT SUMACH ST (PX 1390)',
    type: { studyType: StudyType.TMC },
  };

  const transformedData = reportInstance.transformData(count, countData_5_36781);
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).not.toThrow();
});
