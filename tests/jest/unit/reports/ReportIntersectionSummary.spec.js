/* eslint-disable camelcase */
import path from 'path';

import {
  CentrelineType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import ReportIntersectionSummary from '@/lib/reports/ReportIntersectionSummary';
import { loadJsonSync } from '@/lib/test/TestDataLoader';

const countData_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_38661.json'),
);
const transformedData_INTERSECTION_SUMMARY_5_38661 = loadJsonSync(
  path.resolve(__dirname, './data/transformedData_INTERSECTION_SUMMARY_5_38661.json'),
);

function setup_5_38661() {
  const study = {
    centrelineId: 13456854,
    centrelineType: CentrelineType.INTERSECTION,
    countGroupId: 38661,
    type: { id: 5, studyType: StudyType.TMC },
  };

  const count = {
    hours: StudyHours.ROUTINE,
    id: 38661,
    locationDesc: 'OVERLEA BLVD AT THORNCLIFFE PARK DR & E TCS (PX 679)',
  };
  const intersection = {
    geom: {
      type: 'Point',
      coordinates: [-79.343625497, 43.70747321],
    },
  };
  const segments = [
    {
      centrelineId: 649,
      geom: {
        type: 'LineString',
        coordinates: [
          [-79.349877201, 43.70500665],
          [-79.349308494, 43.705553926],
          [-79.349210149, 43.705648311],
          [-79.349133972, 43.70572022],
          [-79.349046938, 43.705796617],
          [-79.348959121, 43.705868512],
          [-79.348795579, 43.705989814],
          [-79.34868914, 43.706070684],
          [-79.348574187, 43.706142543],
          [-79.348422744, 43.706227855],
          [-79.348288444, 43.706286182],
          [-79.348150225, 43.706353505],
          [-79.347957711, 43.706434255],
          [-79.347774907, 43.706497017],
          [-79.347603766, 43.706555292],
          [-79.347433416, 43.706604568],
          [-79.34728871, 43.706635875],
          [-79.34720954, 43.706662772],
          [-79.343625497, 43.70747321],
        ],
      },
      roadId: 278,
    },
    {
      centrelineId: 3829449,
      geom: {
        type: 'LineString',
        coordinates: [
          [-79.342780375, 43.705549757],
          [-79.342832909, 43.705620743],
          [-79.342877636, 43.705707982],
          [-79.342922628, 43.705807202],
          [-79.342964689, 43.705903473],
          [-79.342983796, 43.705947236],
          [-79.343026878, 43.706042077],
          [-79.343056291, 43.706120807],
          [-79.343088579, 43.706206083],
          [-79.343625497, 43.70747321],
        ],
      },
      roadId: 354,
    },
    {
      centrelineId: 6853474,
      geom: {
        type: 'LineString',
        coordinates: [
          [-79.343625497, 43.70747321],
          [-79.341387089, 43.708017748],
        ],
      },
      roadId: 278,
    },
    {
      centrelineId: 8895679,
      geom: {
        type: 'LineString',
        coordinates: [
          [-79.343625497, 43.70747321],
          [-79.343716829, 43.7076292],
          [-79.3439986, 43.708259097],
        ],
      },
      roadId: 354,
    },
  ];

  return {
    count,
    countData: countData_5_38661,
    intersection,
    segments,
    study,
  };
}

test('ReportIntersectionSummary#transformData [Overlea and Thorncliffe: 5/38661]', () => {
  const reportInstance = new ReportIntersectionSummary();

  const {
    count,
    countData,
    intersection,
    segments,
    study,
  } = setup_5_38661();

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
  } = setup_5_38661();

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
