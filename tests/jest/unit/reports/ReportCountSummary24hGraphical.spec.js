/* eslint-disable camelcase */
import path from 'path';

import { CardinalDirection } from '@/lib/Constants';
import ReportCountSummary24hGraphical from '@/lib/reports/ReportCountSummary24hGraphical';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateAtrSpeedVolume,
  generateAtrVolume,
  generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
import DateTime from '@/lib/time/DateTime';
import { setup_4_2156283 } from '@/tests/jest/unit/reports/data/SetupTestData';

const transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283.json'),
);

function dateTimeWithHour(hour) {
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return DateTime.fromObject({
    year: 2000,
    month: 1,
    day: 1,
    hour,
    minute,
    second,
  });
}

test('ReportCountSummary24hGraphical#transformData [empty dataset]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  const { countLocation, counts, study } = setup_4_2156283();
  const countData = [];
  const studyData = new Map([[2156283, countData]]);
  const transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  const expected = new Array(24).fill(0);
  expect(transformedData).toEqual([{
    date: study.startDate,
    direction: CardinalDirection.NORTH,
    volumeByHour: expected,
  }]);
});

test('ReportCountSummary24hGraphical#transformData [simple test cases]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  const { countLocation, counts, study } = setup_4_2156283();
  let countData = [
    { t: dateTimeWithHour(11), data: { COUNT: 42 } },
  ];
  let studyData = new Map([[2156283, countData]]);
  let transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  let expected = new Array(24).fill(0);
  expected[11] = 42;
  expect(transformedData).toEqual([{
    date: study.startDate,
    direction: CardinalDirection.NORTH,
    volumeByHour: expected,
  }]);

  countData = [
    { t: dateTimeWithHour(1), data: { COUNT: 6 } },
    { t: dateTimeWithHour(2), data: { COUNT: 17 } },
    { t: dateTimeWithHour(2), data: { COUNT: 2 } },
    { t: dateTimeWithHour(3), data: { COUNT: 73 } },
  ];
  studyData = new Map([[2156283, countData]]);
  transformedData = reportInstance.transformData(null, { countLocation, counts, studyData });
  expected = new Array(24).fill(0);
  expected[1] = 6;
  expected[2] = 19;
  expected[3] = 73;
  expect(transformedData).toEqual([{
    date: study.startDate,
    direction: CardinalDirection.NORTH,
    volumeByHour: expected,
  }]);
});

test('ReportCountSummary24hGraphical#transformData [fuzz test, ATR speed / volume]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  const { countLocation, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrSpeedVolume();
    const studyData = new Map([[2156283, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24hGraphical#transformData [fuzz test, ATR volume]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  const { countLocation, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateAtrVolume();
    const studyData = new Map([[2156283, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24hGraphical#transformData [fuzz test, ATR volume with missing]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  const { countLocation, counts, study } = setup_4_2156283();
  for (let i = 0; i < 3; i++) {
    const countData = generateWithMissing(generateAtrVolume());
    const studyData = new Map([[2156283, countData]]);
    expect(() => {
      reportInstance.transformData(study, { countLocation, counts, studyData });
    }).not.toThrow();
  }
});

test('ReportCountSummary24hGraphical#transformData [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

  /*
   * Note that this is a speed / volume ATR count, so we're actually getting more than
   * one data point per hour.  This allows us to test that the 24-hour graphical report
   * works in this case.
   */
  const {
    countLocation,
    counts,
    study,
    studyData,
  } = setup_4_2156283();
  let transformedData = reportInstance.transformData(study, { countLocation, counts, studyData });
  expect(transformedData).toHaveLength(1);
  const { date, direction, volumeByHour } = transformedData[0];
  expect(date.equals(study.startDate)).toBe(true);
  expect(direction).toBe(CardinalDirection.NORTH);
  transformedData = volumeByHour;

  expect(transformedData).toEqual(transformedData_COUNT_SUMMARY_24H_GRAPHICAL_4_2156283);
});

test('ReportCountSummary24hGraphical#generateCsv [Morningside S of Lawrence: 4/2156283]', () => {
  const reportInstance = new ReportCountSummary24hGraphical();

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
