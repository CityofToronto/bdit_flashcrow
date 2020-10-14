/* eslint-disable camelcase */
import path from 'path';

import { StudyHours } from '@/lib/Constants';
import ReportIntersectionSummary from '@/lib/reports/ReportIntersectionSummary';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  setup_5_34621_directional,
  setup_5_38661_directional,
} from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_INTERSECTION_SUMMARY_5_34621 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_INTERSECTION_SUMMARY_5_34621.json'),
);
const transformedData_INTERSECTION_SUMMARY_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_INTERSECTION_SUMMARY_5_38661.json'),
);

// 3-WAY INTERSECTION

test('ReportIntersectionSummary#transformData [Chesswood and Champagne: 5/34621]', () => {
  const reportInstance = new ReportIntersectionSummary();

  const {
    count,
    countData,
    intersection,
    segments,
    study,
  } = setup_5_34621_directional();

  let transformedData = reportInstance.transformData(study, {
    count,
    countData,
    intersection,
    segments,
  });
  const { hours, px, ...transformedDataRest } = transformedData;
  expect(hours).toBe(StudyHours.ROUTINE);
  expect(px).toBe(null);
  transformedData = transformedDataRest;
  expect(transformedData).toEqual(transformedData_INTERSECTION_SUMMARY_5_34621);
});

test('ReportIntersectionSummary#generateCsv [Chesswood and Champagne: 5/34621]', () => {
  const reportInstance = new ReportIntersectionSummary();

  const {
    count,
    countData,
    intersection,
    segments,
    study,
  } = setup_5_34621_directional();

  const transformedData = reportInstance.transformData(study, {
    count,
    countData,
    intersection,
    segments,
  });
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).not.toThrow();
});

// 4-WAY INTERSECTION

test('ReportIntersectionSummary#transformData [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportIntersectionSummary();

  const {
    count,
    countData,
    intersection,
    segments,
    study,
  } = setup_5_38661_directional();

  let transformedData = reportInstance.transformData(study, {
    count,
    countData,
    intersection,
    segments,
  });
  const { hours, px, ...transformedDataRest } = transformedData;
  expect(hours).toBe(StudyHours.ROUTINE);
  expect(px).toBe(679);
  transformedData = transformedDataRest;
  expect(transformedData).toEqual(transformedData_INTERSECTION_SUMMARY_5_38661);
});

test('ReportIntersectionSummary#generateCsv [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportIntersectionSummary();

  const {
    count,
    countData,
    intersection,
    segments,
    study,
  } = setup_5_38661_directional();

  const transformedData = reportInstance.transformData(study, {
    count,
    countData,
    intersection,
    segments,
  });
  expect(() => {
    reportInstance.generateCsv(count, transformedData);
  }).not.toThrow();
});
