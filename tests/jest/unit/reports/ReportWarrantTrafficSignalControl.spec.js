/* eslint-disable camelcase */
import { CardinalDirection, FeatureCode } from '@/lib/Constants';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportWarrantTrafficSignalControl from '@/lib/reports/ReportWarrantTrafficSignalControl';
import {
  generateHourlyMajorAndMinorDirections,
  generateTmc,
} from '@/lib/test/random/CountDataGenerator';

import countData_5_38661 from './data/countData_5_38661.json';
import transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661 from
  './data/transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661.json';

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

test('ReportIntersectionSummary#transformData [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();

  const countData = countData_5_38661.map(({
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
  const hourlyData = ReportBaseFlowDirectional.sumHourly(countData);
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
  const transformedData = reportInstance.transformData(null, {
    countData,
    hourlyData,
    hourlyMajorDirections,
    hourlyMinorDirections,
    minFeatureCode,
    segments,
  }, options);
  expect(transformedData).toEqual(transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661);
});
