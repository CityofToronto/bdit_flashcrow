/* eslint-disable camelcase */
import ReportCountSummary24hGraphical from '@/lib/reports/ReportCountSummary24hGraphical';

import countData_4_2156283 from './data/countData_4_2156283.json';
import transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283 from
  './data/transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283.json';

function dateWithHour(h) {
  const m = Math.floor(Math.random() * 60);
  const s = Math.floor(Math.random() * 60);
  return new Date(2000, 0, 1, h, m, s);
}

test('ReportCountSummary24hGraphical#transformData', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  let countData = [];
  let volumeByHour = reportInstance.transformData(countData);
  let expected = new Array(24).fill(0);
  expect(volumeByHour).toEqual(expected);

  countData = [
    { t: dateWithHour(11), data: { COUNT: 42 } },
  ];
  volumeByHour = reportInstance.transformData(countData);
  expected = new Array(24).fill(0);
  expected[11] = 42;
  expect(volumeByHour).toEqual(expected);

  countData = [
    { t: dateWithHour(1), data: { COUNT: 6 } },
    { t: dateWithHour(2), data: { COUNT: 17 } },
    { t: dateWithHour(2), data: { COUNT: 2 } },
    { t: dateWithHour(3), data: { COUNT: 73 } },
  ];
  volumeByHour = reportInstance.transformData(countData);
  expected = new Array(24).fill(0);
  expected[1] = 6;
  expected[2] = 19;
  expected[3] = 73;
  expect(volumeByHour).toEqual(expected);
});

test('ReportCountSummary24hGraphical#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

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
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour graphical report
   * works in this case.
   */
  const transformedData = reportInstance.transformData(countData);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283);
});
