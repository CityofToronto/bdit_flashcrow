/* eslint-disable camelcase */
import { CardinalDirection } from '@/lib/Constants';
import ReportIntersectionSummary from '@/lib/reports/ReportIntersectionSummary';
import {
  generateMajorAndMinorDirections,
  generateTmc,
} from '@/lib/test/random/CountDataGenerator';

import countData_5_38661 from './data/countData_5_38661.json';
import transformedData_INTERSECTION_SUMMARY_5_38661 from
  './data/transformedData_INTERSECTION_SUMMARY_5_38661.json';

test('ReportIntersectionSummary#transformData', () => {
  const reportInstance = new ReportIntersectionSummary();

  // fuzz test
  for (let i = 0; i < 25; i++) {
    const countData = generateTmc();
    const { majorDirections, minorDirections } = generateMajorAndMinorDirections();
    expect(() => {
      reportInstance.transformData({
        countData,
        majorDirections,
        minorDirections,
      });
    }).not.toThrow();
  }
});

test('ReportIntersectionSummary#transformData [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportIntersectionSummary();

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
  const minorDirections = [CardinalDirection.NORTH, CardinalDirection.SOUTH];

  const { hourlyTotals, totals } = reportInstance.transformData({
    countData,
    majorDirections,
    minorDirections,
  });
  expect(hourlyTotals).toEqual(
    transformedData_INTERSECTION_SUMMARY_5_38661.data.hourlyTotals,
  );
  expect(totals).toEqual(
    transformedData_INTERSECTION_SUMMARY_5_38661.data.totals,
  );
});
