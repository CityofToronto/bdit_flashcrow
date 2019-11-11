/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummary24hGraphical from '@/lib/reports/ReportCountSummary24hGraphical';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';

const countData_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/countData_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283.json'),
);

function dateTimeWithHour(hour) {
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return DateTime.fromObject({
    year: 2000,
    month: 1,
    day: 1,
    hour,
    minute,
    second,
  });
}

test('ReportCountSummary24hGraphical#transformData', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  let countData = [];
  let volumeByHour = reportInstance.transformData(null, countData);
  let expected = new Array(24).fill(0);
  expect(volumeByHour).toEqual(expected);

  countData = [
    { t: dateTimeWithHour(11), data: { COUNT: 42 } },
  ];
  volumeByHour = reportInstance.transformData(null, countData);
  expected = new Array(24).fill(0);
  expected[11] = 42;
  expect(volumeByHour).toEqual(expected);

  countData = [
    { t: dateTimeWithHour(1), data: { COUNT: 6 } },
    { t: dateTimeWithHour(2), data: { COUNT: 17 } },
    { t: dateTimeWithHour(2), data: { COUNT: 2 } },
    { t: dateTimeWithHour(3), data: { COUNT: 73 } },
  ];
  volumeByHour = reportInstance.transformData(null, countData);
  expected = new Array(24).fill(0);
  expected[1] = 6;
  expected[2] = 19;
  expected[3] = 73;
  expect(volumeByHour).toEqual(expected);
});

test('ReportCountSummary24hGraphical#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour graphical report
   * works in this case.
   */
  const transformedData = reportInstance.transformData(null, countData_4_2156283);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283);
});

test('ReportCountSummary24hGraphical#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  const count = {
    date: DateTime.fromSQL('2019-03-07 00:00:00'),
    locationDesc: 'MORNINGSIDE AVE N/B S OF LAWRENCE AVE',
    type: { name: 'SPEED' },
  };

  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour graphical report
   * works in this case.
   */
  const transformedData = reportInstance.transformData(count, countData_4_2156283);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283);
});

test('ReportCountSummary24hGraphical#generateCsv [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  const count = {
    date: DateTime.fromSQL('2019-03-07 00:00:00'),
    locationDesc: 'MORNINGSIDE AVE N/B S OF LAWRENCE AVE',
    type: { name: 'SPEED' },
  };

  const transformedData = reportInstance.transformData(count, countData_4_2156283);
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).not.toThrow();
});
