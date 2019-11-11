/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummary24hDetailed from '@/lib/reports/ReportCountSummary24hDetailed';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';

const countData_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/countData_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283.json'),
);

test('ReportCountSummary24hDetailed#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

  const count = {
    date: DateTime.fromSQL('2019-03-07 00:00:00'),
    locationDesc: 'MORNINGSIDE AVE N/B S OF LAWRENCE AVE',
    type: { name: 'SPEED' },
  };

  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour detailed report
   * works in this case.
   */
  const transformedData = reportInstance.transformData(count, countData_4_2156283);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283);
});

test('ReportCountSummary24hGraphical#generateCsv [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

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
