/* eslint-disable camelcase */
import path from 'path';

import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_24H_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283.json'),
);
const transformedData_COUNT_SUMMARY_24H_4_2156283_empty = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_4_2156283_empty.json'),
);

test('ReportCountSummary24h#transformData [empty dataset]', () => {
  const reportInstance = new ReportCountSummary24h();

  const { countLocation, counts, study } = setup_4_2156283();
  const studyData = new Map([[2156283, []]]);
  const transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_4_2156283_empty);
});

test('ReportCountSummary24h#transformData [fuzz test, ATR speed / volume]', () => {
  const reportInstance = new ReportCountSummary24h();

  const { countLocation, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrSpeedVolume();
    const studyData = new Map([[2156283, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24h#transformData [fuzz test, ATR volume]', () => {
  const reportInstance = new ReportCountSummary24h();

  const { countLocation, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrVolume();
    const studyData = new Map([[2156283, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24h#transformData [fuzz test, ATR volume with missing]', () => {
  const reportInstance = new ReportCountSummary24h();

  const { countLocation, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateWithMissing(generateAtrVolume());
    const studyData = new Map([[2156283, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24h#transformData [Morningside S of Lawrence: ATR_SPEED_VOLUME/2156283]', () => {
  const reportInstance = new ReportCountSummary24h();
  const {
    countLocation,
    counts,
    study,
    studyData,
  } = setup_4_2156283();
  const transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_4_2156283);
});

test('ReportCountSummary24h#generateCsv [Morningside S of Lawrence: ATR_SPEED_VOLUME/2156283]', () => {
  const reportInstance = new ReportCountSummary24h();
  const {
    countLocation,
    counts,
    study,
    studyData,
  } = setup_4_2156283();
  const transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  expect(() => {
    reportInstance.generateCsv(study, transformedData);
  }).not.toThrow();
});
