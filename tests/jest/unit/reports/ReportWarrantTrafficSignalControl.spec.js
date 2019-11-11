/* eslint-disable camelcase */
import path from 'path';

import { CardinalDirection, FeatureCode } from '@/lib/Constants';
import { NotImplementedError } from '@/lib/error/MoveErrors';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportWarrantTrafficSignalControl from '@/lib/reports/ReportWarrantTrafficSignalControl';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateHourlyMajorAndMinorDirections,
  generateTmc,
} from '@/lib/test/random/CountDataGenerator';
import DateTime from '@/lib/time/DateTime';

const countData_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_38661.json'),
);
const transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661.json'),
);

test('ReportWarrantTrafficSignalControl#transformData', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();

  // fuzz test
  for (let i = 0; i < 25; i++) {
    const countData = generateTmc();
    const hourlyData = ReportBaseFlowDirectional.sumHourly(countData);
    // TODO: generate minFeatureCode
    const minFeatureCode = FeatureCode.MINOR_ARTERIAL;
    const {
      hourlyMajorDirections,
      hourlyMinorDirections,
    } = generateHourlyMajorAndMinorDirections(hourlyData);
    // TODO: generate segments
    const segments = new Array(4).fill(0);
    const options = {
      adequateTrial: true,
      collisionsTotal: 25,
      preparedBy: 'Foo Bar',
      preventablesByYear: [3, 5, 10],
      startYear: 2016,
    };
    expect(() => {
      reportInstance.transformData(null, {
        countData,
        hourlyData,
        hourlyMajorDirections,
        hourlyMinorDirections,
        minFeatureCode,
        segments,
      }, options);
    }).not.toThrow();
  }
});

test('ReportWarrantTrafficSignalControl#transformData [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();

  const count = {
    date: DateTime.fromSQL('2019-04-13 00:00:00'),
    locationDesc: 'OVERLEA BLVD AT THORNCLIFFE PARK DR & E TCS (PX 679)',
    type: { name: 'TMC' },
  };

  const hourlyData = ReportBaseFlowDirectional.sumHourly(countData_5_38661);
  const hourlyMajorDirections = hourlyData.map(
    () => [CardinalDirection.EAST, CardinalDirection.WEST],
  );
  const hourlyMinorDirections = hourlyData.map(
    () => [CardinalDirection.NORTH, CardinalDirection.SOUTH],
  );
  const minFeatureCode = FeatureCode.MAJOR_ARTERIAL;
  const segments = new Array(4).fill(0);

  const options = {
    adequateTrial: true,
    collisionsTotal: 25,
    preparedBy: 'Foo Bar',
    preventablesByYear: [3, 5, 10],
    startYear: 2016,
  };
  const transformedData = reportInstance.transformData(count, {
    countData: countData_5_38661,
    hourlyData,
    hourlyMajorDirections,
    hourlyMinorDirections,
    minFeatureCode,
    segments,
  }, options);
  expect(transformedData).toEqual(transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661);
});

test('ReportWarrantTrafficSignalControl#generateCsv [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();

  const count = {
    date: DateTime.fromSQL('2019-04-13 00:00:00'),
    locationDesc: 'OVERLEA BLVD AT THORNCLIFFE PARK DR & E TCS (PX 679)',
    type: { name: 'TMC' },
  };

  const hourlyData = ReportBaseFlowDirectional.sumHourly(countData_5_38661);
  const hourlyMajorDirections = hourlyData.map(
    () => [CardinalDirection.EAST, CardinalDirection.WEST],
  );
  const hourlyMinorDirections = hourlyData.map(
    () => [CardinalDirection.NORTH, CardinalDirection.SOUTH],
  );
  const minFeatureCode = FeatureCode.MAJOR_ARTERIAL;
  const segments = new Array(4).fill(0);

  const options = {
    adequateTrial: true,
    collisionsTotal: 25,
    preparedBy: 'Foo Bar',
    preventablesByYear: [3, 5, 10],
    startYear: 2016,
  };
  const transformedData = reportInstance.transformData(count, {
    countData: countData_5_38661,
    hourlyData,
    hourlyMajorDirections,
    hourlyMinorDirections,
    minFeatureCode,
    segments,
  }, options);
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).toThrow(NotImplementedError);
});
