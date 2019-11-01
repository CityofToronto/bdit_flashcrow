/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummary24hDetailed from '@/lib/reports/ReportCountSummary24hDetailed';
import { loadJsonSync } from '@/lib/test/TestDataLoader';

const countData_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/countData_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283.json'),
);

test('ReportCountSummary24hDetailed#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour detailed report
   * works in this case.
   */
  const transformedData = reportInstance.transformData(null, countData_4_2156283);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283);
});
