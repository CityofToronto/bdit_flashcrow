/* eslint-disable camelcase */
import path from 'path';

import { CardinalDirection } from '@/lib/Constants';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportIntersectionSummary from '@/lib/reports/ReportIntersectionSummary';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateHourlyMajorAndMinorDirections,
  generateTmc,
} from '@/lib/test/random/CountDataGenerator';

const countData_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_38661.json'),
);
const transformedData_INTERSECTION_SUMMARY_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_INTERSECTION_SUMMARY_5_38661.json'),
);

test('ReportIntersectionSummary#transformData', () => {
  const reportInstance = new ReportIntersectionSummary();

  // fuzz test
  for (let i = 0; i < 25; i++) {
    const countData = generateTmc();
    const hourlyData = ReportBaseFlowDirectional.sumHourly(countData);
    const {
      hourlyMajorDirections,
      hourlyMinorDirections,
    } = generateHourlyMajorAndMinorDirections(hourlyData);
    expect(() => {
      reportInstance.transformData(null, {
        countData,
        hourlyData,
        hourlyMajorDirections,
        hourlyMinorDirections,
      });
    }).not.toThrow();
  }
});

test('ReportIntersectionSummary#transformData [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportIntersectionSummary();

  const hourlyData = ReportBaseFlowDirectional.sumHourly(countData_5_38661);
  const hourlyMajorDirections = hourlyData.map(
    () => [CardinalDirection.EAST, CardinalDirection.WEST],
  );
  const hourlyMinorDirections = hourlyData.map(
    () => [CardinalDirection.NORTH, CardinalDirection.SOUTH],
  );

  const transformedData = reportInstance.transformData(null, {
    countData: countData_5_38661,
    hourlyData,
    hourlyMajorDirections,
    hourlyMinorDirections,
  });
  expect(transformedData).toEqual(transformedData_INTERSECTION_SUMMARY_5_38661);
});
