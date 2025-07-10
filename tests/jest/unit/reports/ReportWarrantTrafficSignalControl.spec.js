// /* eslint-disable camelcase */
// import path from 'path';

// import { StudyHours } from '@/lib/Constants';
import { NotImplementedError } from '@/lib/error/MoveErrors';
import ReportWarrantTrafficSignalControl from '@/lib/reports/ReportWarrantTrafficSignalControl';
// import { loadJsonSync } from '@/lib/test/TestDataLoader';
import {
  generateTmc,
  generateTmc14Hour,
  // generateWithMissing,
} from '@/lib/test/random/CountDataGenerator';
import DateTime from '@/lib/time/DateTime';
import {
  // eslint-disable-next-line camelcase
  setup_5_38661_directional,
} from '@/tests/jest/unit/reports/data/SetupTestData';

// const transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661 = loadJsonSync(
//   path.resolve(__dirname, './data/transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661.json'),
// );
// const transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661_empty = loadJsonSync(
//   path.resolve(
//     __dirname,
//     './data/transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661_empty.json',
//   ),
// );

// test('ReportWarrantTrafficSignalControl#transformData [empty dataset]', () => {
//   const reportInstance = new ReportWarrantTrafficSignalControl();
//   const {
//     count,
//     intersection,
//     segments,
//     study,
//   } = setup_5_38661_directional();
//   const countData = [];
//   const options = {
//     adequateTrial: true,
//     isTwoLane: false,
//     isXIntersection: true,
//     allSeverities: [1, 5, 2],
//     allKsi: [2, 6, 2],
//     preventablesByYear: [3, 5, 10],
//     startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
//   };

//   let transformedData = reportInstance.transformData(study, {
//     count,
//     countData,
//     intersection,
//     segments,
//   }, options);
//   const {
//     hours,
//     isTwoLane,
//     isXIntersection,
//     px,
//     ...transformedDataRest
//   } = transformedData;
//   expect(hours).toBe(StudyHours.ROUTINE);
//   expect(isTwoLane).toBe(false);
//   expect(isXIntersection).toBe(true);
//   expect(px).toBe(679);
//   transformedData = transformedDataRest;
//   expect(transformedData).toEqual(transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661_empty);
// });

test('ReportWarrantTrafficSignalControl#transformData [fuzz test, TMC]', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();
  const {
    count,
    intersection,
    segments,
    study,
  } = setup_5_38661_directional();
  const options = {
    adequateTrial: true,
    isTwoLane: false,
    isXIntersection: true,
    allSeverities: [1, 5, 2],
    allKsi: [2, 6, 2],
    preventablesByYear: [3, 5, 10],
    startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
  };

  for (let i = 0; i < 3; i++) {
    const countData = generateTmc();
    expect(() => {
      reportInstance.transformData(study, {
        count,
        countData,
        intersection,
        segments,
      }, options);
    }).not.toThrow();
  }
});

test('ReportWarrantTrafficSignalControl#transformData [fuzz test, TMC 14-hour]', () => {
  const reportInstance = new ReportWarrantTrafficSignalControl();
  const {
    count,
    intersection,
    segments,
    study,
  } = setup_5_38661_directional();

  const options = {
    adequateTrial: true,
    isTwoLane: false,
    isXIntersection: true,
    allSeverities: [1, 5, 2],
    allKsi: [2, 6, 2],
    preventablesByYear: [3, 5, 10],
    startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
  };

  for (let i = 0; i < 3; i++) {
    const countData = generateTmc14Hour();
    expect(() => {
      reportInstance.transformData(study, {
        count,
        countData,
        intersection,
        segments,
      }, options);
    }).not.toThrow();
  }
});

// test('ReportWarrantTrafficSignalControl#transformData [fuzz test, TMC with missing]', () => {
//   const reportInstance = new ReportWarrantTrafficSignalControl();
//   const {
//     count,
//     intersection,
//     segments,
//     study,
//   } = setup_5_38661_directional();
//   const options = {
//     adequateTrial: true,
//     isTwoLane: false,
//     isXIntersection: true,
//     allSeverities: [1, 5, 2],
//     allKsi: [2, 6, 2],
//     preventablesByYear: [3, 5, 10],
//     startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
//   };

//   for (let i = 0; i < 3; i++) {
//     const countData = generateWithMissing(generateTmc());
//     expect(() => {
//       reportInstance.transformData(study, {
//         count,
//         countData,
//         intersection,
//         segments,
//       }, options);
//     }).not.toThrow();
//   }
// });

// test('ReportWarrantTrafficSignalControl#transformData[Overlea and Thorncliffe: 5/38661]', () => {
//   const reportInstance = new ReportWarrantTrafficSignalControl();
//   const {
//     count,
//     countData,
//     intersection,
//     segments,
//     study,
//   } = setup_5_38661_directional();
//   const options = {
//     adequateTrial: true,
//     isTwoLane: false,
//     isXIntersection: true,
//     allSeverities: [1, 5, 2],
//     allKsi: [2, 6, 2],
//     preventablesByYear: [3, 5, 10],
//     startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
//   };

//   let transformedData = reportInstance.transformData(study, {
//     count,
//     countData,
//     intersection,
//     segments,
//   }, options);
//   const {
//     hours,
//     isTwoLane,
//     isXIntersection,
//     px,
//     ...transformedDataRest
//   } = transformedData;
//   expect(hours).toBe(StudyHours.ROUTINE);
//   expect(isTwoLane).toBe(false);
//   expect(isXIntersection).toBe(true);
//   expect(px).toBe(679);
//   transformedData = transformedDataRest;

//   expect(transformedData).toEqual(transformedData_WARRANT_TRAFFIC_SIGNAL_CONTROL_5_38661);
// });

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
    allSeverities: [1, 5, 2],
    allKsi: [2, 6, 2],
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
