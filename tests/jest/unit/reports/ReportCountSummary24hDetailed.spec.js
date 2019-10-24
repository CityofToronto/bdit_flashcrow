/* eslint-disable camelcase */
import ReportCountSummary24hDetailed from '@/lib/reports/ReportCountSummary24hDetailed';

import countData_4_2156283 from './data/countData_4_2156283.json';
import transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283 from
  './data/transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283.json';

test('ReportCountSummary24hDetailed#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hDetailed();

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

  const expectedData = transformedData_COUNT_SUMMARY_24H_DETAILED_4_2156283.map(
    ({ t: tStr, count }) => {
      const t = new Date(tStr.slice(0, -1));
      return { t, count };
    },
  );
  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour detailed report
   * works in this case.
   */
  const transformedData = reportInstance.transformData(null, countData);
  expect(transformedData).toEqual(expectedData);
});
