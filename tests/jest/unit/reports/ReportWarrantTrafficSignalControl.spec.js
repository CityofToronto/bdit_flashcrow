/* eslint-disable camelcase */
import path from 'path';

import { StudyHours } from '@/lib/Constants';
import { NotImplementedError } from '@/lib/error/MoveErrors';
import ReportWarrantTrafficSignalControl from '@/lib/reports/ReportWarrantTrafficSignalControl';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';
import {
  setup_5_38661_directional,
} from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661.json'),
);

test('ReportWarrantTrafficSignalControl#transformData [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();
  const {
    count,
    countData,
    intersection,
    segments,
    study,
  } = setup_5_38661_directional();
  const options = {
    adequateTrial: true,
    isTwoLane: false,
    isXIntersection: true,
    preventablesByYear: [3, 5, 10],
    startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
  };

  let transformedData = reportInstance.transformData(study, {
    count,
    countData,
    intersection,
    segments,
  }, options);
  const {
    hours,
    isTwoLane,
    isXIntersection,
    px,
    ...transformedDataRest
  } = transformedData;
  expect(hours).toBe(StudyHours.ROUTINE);
  expect(isTwoLane).toBe(false);
  expect(isXIntersection).toBe(true);
  expect(px).toBe(679);
  transformedData = transformedDataRest;
  expect(transformedData).toEqual(transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661);
});

test('ReportWarrantTrafficSignalControl#generateCsv [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();
  const {
    count,
    countData,
    intersection,
    segments,
    study,
  } = setup_5_38661_directional();
  const options = {
    adequateTrial: true,
    isTwoLane: false,
    isXIntersection: true,
    preventablesByYear: [3, 5, 10],
    startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
  };
  const transformedData = reportInstance.transformData(study, {
    count,
    countData,
    intersection,
    segments,
  }, options);
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).toThrow(NotImplementedError);
});
