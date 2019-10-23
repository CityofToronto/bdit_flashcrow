/* eslint-disable camelcase */
import ReportSpeedPercentile from '@/lib/reports/ReportSpeedPercentile';

import countData_4_2156283 from './data/countData_4_2156283.json';
import transformedData_SPEED_PERCENTILE_4_2156283 from
  './data/transformedData_SPEED_PERCENTILE_4_2156283.json';

expect.extend({
  toBeWithinTolerance(received, expected, tolerance) {
    const pass = Math.abs(received - expected) <= tolerance;
    if (pass) {
      const msg = `expected ${received} to be outside tolerance ${tolerance} of ${expected}`;
      return {
        message: () => msg,
        pass: true,
      };
    }
    const msg = `expected ${received} to be within tolerance ${tolerance} of ${expected}`;
    return {
      message: () => msg,
      pass: false,
    };
  },
});

test('ReportSpeedPercentile#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportSpeedPercentile();

  const countData = countData_4_2156283.map(({
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

  /*
   * Replicating TraxPro's histogram calculation *exactly* is difficult, so we
   * tolerate some deviation from legacy report values.
   */
  const transformedData = reportInstance.transformData(null, countData);
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
