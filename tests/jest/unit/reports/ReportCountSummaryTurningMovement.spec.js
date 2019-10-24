/* eslint-disable camelcase */
import ArrayUtils from '@/lib/ArrayUtils';

import ObjectUtils from '@/lib/ObjectUtils';
import Random from '@/lib/Random';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import { generateTmc } from '@/lib/test/random/CountDataGenerator';

import countData_5_36781 from './data/countData_5_36781.json';
import transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781 from
  './data/transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781.json';

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

  const countData = countData_5_36781.map(({
    id,
    countId,
    t,
    data,
  }) => ({
    id,
    countId,
    t: new Date(t.slice(0, -1)),
    data,
  }));

  const expectedData = ObjectUtils.map(
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
    transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_5_36781,
    section => ObjectUtils.map(
      section,
      (value, key) => {
        if (key === 'timeRange') {
          let { start, end } = value;
          start = new Date(start.slice(0, -1));
          end = new Date(end.slice(0, -1));
          return { start, end };
        }
        return value;
      },
    ),
  );

  const transformedData = reportInstance.transformData(null, countData);
  expect(transformedData).toEqual(expectedData);
});
