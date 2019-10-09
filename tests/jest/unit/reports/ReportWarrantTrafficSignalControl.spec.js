/* eslint-disable camelcase */
import { CardinalDirection, FeatureCode } from '@/lib/Constants';
import ReportWarrantTrafficSignalControl from '@/lib/reports/ReportWarrantTrafficSignalControl';
import {
  generateMajorAndMinorDirections,
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
    // TODO: generate minFeatureCode
    const minFeatureCode = FeatureCode.MINOR_ARTERIAL;
    const { majorDirections, minorDirections } = generateMajorAndMinorDirections();
    // TODO: generate segments
    const segments = new Array(4).fill(0);
    expect(() => {
      reportInstance.transformData({
        countData,
        majorDirections,
        minFeatureCode,
        minorDirections,
        segments,
      });
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
  const majorDirections = [CardinalDirection.EAST, CardinalDirection.WEST];
  const minFeatureCode = FeatureCode.MAJOR_ARTERIAL;
  const minorDirections = [CardinalDirection.NORTH, CardinalDirection.SOUTH];
  const segments = new Array(4).fill(0);

  const transformedData = reportInstance.transformData({
    countData,
    majorDirections,
    minFeatureCode,
    minorDirections,
    segments,
  });
  expect(transformedData).toEqual(transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661);
});
