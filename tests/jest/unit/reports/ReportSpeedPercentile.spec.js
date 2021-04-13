/* eslint-disable camelcase */
import path from 'path';

import { CardinalDirection, SPEED_CLASSES } from '@/lib/Constants';
import ReportSpeedPercentile from '@/lib/reports/ReportSpeedPercentile';
import { toBeWithinTolerance } from '@/lib/test/ExpectMatchers';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_SPEED_PERCENTILE_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_SPEED_PERCENTILE_4_2156283.json'),
);
const transformedData_SPEED_PERCENTILE_4_2156283_empty = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_SPEED_PERCENTILE_4_2156283_empty.json'),
);

expect.extend({
  toBeWithinTolerance,
});

test('ReportSpeedPercentile.getArrayStats', () => {
  const xs = SPEED_CLASSES.map(() => 0);
  expect(ReportSpeedPercentile.getArrayStats(xs)).toEqual({
    total: 0,
    pct15: null,
    pct50: null,
    pct85: null,
    pct95: null,
    mu: null,
  });

  xs[3] = 1;
  expect(ReportSpeedPercentile.getArrayStats(xs)).toEqual({
    total: 1,
    pct15: 30,
    pct50: 32,
    pct85: 34,
    pct95: 34,
    mu: 32,
  });

  xs[4] = 1;
  expect(ReportSpeedPercentile.getArrayStats(xs)).toEqual({
    total: 2,
    pct15: 31,
    pct50: 35,
    pct85: 38,
    pct95: 39,
    mu: 35,
  });
});

test('ReportSpeedPercentile#transformData [empty dataset]', () => {
  const reportInstance = new ReportSpeedPercentile();

  const { arteries, counts, study } = setup_4_2156283();
  const studyData = new Map([[17, []]]);
  let transformedData = reportInstance.transformData(study, { arteries, counts, studyData });
  expect(transformedData).toHaveLength(1);
  const { date, direction, stats } = transformedData[0];
  expect(date.equals(study.date)).toBe(true);
  expect(direction).toBe(CardinalDirection.NORTH);
  transformedData = stats;
  expect(transformedData).toEqual(transformedData_SPEED_PERCENTILE_4_2156283_empty);
});

test('ReportSpeedPercentile#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportSpeedPercentile();

  /*
   * Replicating TraxPro's histogram calculation *exactly* is difficult, so we
   * tolerate some deviation from legacy report values.
   */
  const {
    arteries,
    counts,
    study,
    studyData,
  } = setup_4_2156283();
  let transformedData = reportInstance.transformData(study, { arteries, counts, studyData });
  expect(transformedData).toHaveLength(1);
  const { date, direction, stats } = transformedData[0];
  expect(date.equals(study.date)).toBe(true);
  expect(direction).toBe(CardinalDirection.NORTH);
  transformedData = stats;

  const {
    countDataByHour,
    hoursPeakAm,
    hoursPeakPm,
    speedClassPercents,
    speedClassTotals,
    totalStats,
  } = transformedData_SPEED_PERCENTILE_4_2156283;

  /*
   * These parts should match exactly, as they deal with raw data and unrounded integer
   * totals thereof.
   */
  countDataByHour.forEach(({ volume, total }, h) => {
    expect(transformedData.countDataByHour[h].volume).toEqual(volume);
    expect(transformedData.countDataByHour[h].total).toEqual(total);
  });
  expect(transformedData.hoursPeakAm).toEqual(hoursPeakAm);
  expect(transformedData.hoursPeakPm).toEqual(hoursPeakPm);
  expect(transformedData.speedClassTotals).toEqual(speedClassTotals);
  expect(transformedData.totalStats.total).toEqual(totalStats.total);

  /*
   * Percentiles should match within 1 kph.
   *
   * We did have to change a couple of values: the first two hourly 95th percentiles
   * are higher by 3-5 kph in MOVE than in TraxPro.
   */
  countDataByHour.forEach(({ pct85, pct95 }, h) => {
    /*
     * The TraxPro reports only give hourly 85th and 95th percentile, so we have no
     * values to test against for the other hourly percentiles.
     */
    expect(transformedData.countDataByHour[h].pct85).toBeWithinTolerance(pct85, 1);
    expect(transformedData.countDataByHour[h].pct95).toBeWithinTolerance(pct95, 1);
  });
  expect(transformedData.totalStats.pct15).toBeWithinTolerance(totalStats.pct15, 1);
  expect(transformedData.totalStats.pct50).toBeWithinTolerance(totalStats.pct50, 1);
  expect(transformedData.totalStats.pct85).toBeWithinTolerance(totalStats.pct85, 1);
  expect(transformedData.totalStats.pct95).toBeWithinTolerance(totalStats.pct95, 1);
  expect(transformedData.totalStats.mu).toBeWithinTolerance(totalStats.mu, 1);

  /*
   * Speed class percentages should match to 3 decimal digits.
   */
  speedClassPercents.forEach((percent, s) => {
    expect(transformedData.speedClassPercents[s]).toBeCloseTo(percent, 2);
  });
});

test('ReportSpeedPercentile#generateCsv [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportSpeedPercentile();

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
