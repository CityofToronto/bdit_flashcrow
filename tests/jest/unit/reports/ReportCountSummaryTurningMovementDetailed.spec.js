/* eslint-disable camelcase */
import ReportCountSummaryTurningMovementDetailed
  from '@/lib/reports/ReportCountSummaryTurningMovementDetailed';

import countData_5_36781 from './data/countData_5_36781.json';
import transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781 from
  './data/transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781.json';

test('ReportCountSummaryTurningMovementDetailed#transformData [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

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

  const expectedData = transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781.map(
    ({ t: tStr, data }) => {
      const t = new Date(tStr.slice(0, -1));
      return { t, data };
    },
  );

  const transformedData = reportInstance.transformData(countData);
  expect(transformedData).toEqual(expectedData);
});
