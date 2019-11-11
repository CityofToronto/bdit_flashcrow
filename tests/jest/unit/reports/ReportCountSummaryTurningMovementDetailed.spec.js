/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummaryTurningMovementDetailed
  from '@/lib/reports/ReportCountSummaryTurningMovementDetailed';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';

const countData_5_36781 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_36781.json'),
);
const transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781 = loadJsonSync(
  path.resolve(
    __dirname,
    './data/transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781.json',
  ),
);

test('ReportCountSummaryTurningMovementDetailed#transformData [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const count = {
    date: DateTime.fromSQL('2018-02-27 00:00:00'),
    locationDesc: 'GERRARD ST AT SUMACH ST (PX 1390)',
    type: { name: 'TMC' },
  };

  const transformedData = reportInstance.transformData(count, countData_5_36781);
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED_5_36781);
});

test('ReportCountSummaryTurningMovementDetailed#generateCsv [Gerrard and Sumach: 5/36781]', () => {
  const reportInstance = new ReportCountSummaryTurningMovementDetailed();

  const count = {
    date: DateTime.fromSQL('2018-02-27 00:00:00'),
    locationDesc: 'GERRARD ST AT SUMACH ST (PX 1390)',
    type: { name: 'TMC' },
  };

  const transformedData = reportInstance.transformData(count, countData_5_36781);
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).not.toThrow();
});
