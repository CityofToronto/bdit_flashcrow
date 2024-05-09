/* eslint-disable camelcase */
import path from 'path';

import {
  CardinalDirection,
  CentrelineType,
  ReportFormat,
  ReportType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CountLocationDAO from '@/lib/db/CountLocationDAO';
import StudyDAO from '@/lib/db/StudyDAO';
import StudyDataDAO from '@/lib/db/StudyDataDAO';
import PoiDAO from '@/lib/db/PoiDAO';
import ReportFactory from '@/lib/reports/ReportFactory';
import MovePdfGenerator from '@/lib/reports/format/MovePdfGenerator';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/db/CountLocationDAO');
jest.mock('@/lib/db/StudyDAO');
jest.mock('@/lib/db/StudyDataDAO');
jest.mock('@/lib/db/PoiDAO');

const countData_4_2156283 = loadJsonSync(
  path.resolve(__dirname, '../data/countData_4_2156283.json'),
);
const countData_5_36781 = loadJsonSync(
  path.resolve(__dirname, '../data/countData_5_36781.json'),
);
const countData_5_38661 = loadJsonSync(
  path.resolve(__dirname, '../data/countData_5_38661.json'),
);

beforeAll(MovePdfGenerator.init);

function setup_4_2156283_single() {
  const study = {
    legacy: true,
    countLocationId: 2946,
    studyType: StudyType.ATR_SPEED_VOLUME,
    countGroupId: 2156281,
    startDate: DateTime.fromSQL('2019-03-07 00:00:00'),
    endDate: DateTime.fromSQL('2019-03-07 00:00:00'),
    duration: 24,
    daysOfWeek: [4],
    hours: null,
    centrelineId: 108387,
    centrelineType: CentrelineType.SEGMENT,
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);

  const countLocation = {
    id: 2946,
    legacy: true,
    description: 'MORNINGSIDE AVE S OF LAWRENCE AVE',
    centrelineId: 108387,
    centrelineType: CentrelineType.SEGMENT,
  };
  CountLocationDAO.byStudy.mockResolvedValue(countLocation);

  const poiResponse = {
    hospital: null,
    school: { id: 1134, geom_dist: 229.636281975754 },
    trafficSignals: [{ px: 499 }],
  };
  PoiDAO.byCentrelineSummary.mockResolvedValue(poiResponse);

  const counts = [{
    id: 2156283,
    legacy: true,
    studyType: StudyType.ATR_SPEED_VOLUME,
    hours: null,
    date: DateTime.fromSQL('2019-03-07 00:00:00'),
    notes: null,
    countLocationId: 2946,
    direction: CardinalDirection.NORTH,
    extraMetadata: { arteryCode: 2946, stationCode: '2946' },
  }];
  const studyData = new Map([[2156283, countData_4_2156283]]);
  StudyDataDAO.byStudy.mockResolvedValue({ countLocation, counts, studyData });
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineId: 108387,
    centrelineType: CentrelineType.SEGMENT,
    description: 'Morningside Ave: Ling Rd \u2013 Lawrence Ave E',
    geom: {
      type: 'LineString',
      coordinates: [
        [-79.185658967, 43.766607205],
        [-79.18592188, 43.767247008],
        [-79.186002302, 43.767454258],
        [-79.186063368, 43.767652454],
        [-79.186093667, 43.767796558],
        [-79.18613935, 43.767967706],
        [-79.186152665, 43.768093762],
        [-79.18618223, 43.768228859],
        [-79.186225546, 43.768408999],
      ],
    },
  });
}

function setup_5_36781() {
  const study = {
    legacy: true,
    countLocationId: 5074,
    studyType: StudyType.TMC,
    countGroupId: 36781,
    startDate: DateTime.fromSQL('2018-02-27 00:00:00'),
    endDate: DateTime.fromSQL('2018-02-27 00:00:00'),
    duration: null,
    daysOfWeek: [2],
    hours: StudyHours.SCHOOL,
    centrelineId: 13464586,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.361498301, 43.663158537],
    },
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);

  const countLocation = {
    id: 5074,
    legacy: true,
    description: 'GERRARD ST AT SUMACH ST (PX 1390)',
    centrelineId: 13464586,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.361498301, 43.663158537],
    },
  };

  const poiResponse = {
    hospital: null,
    school: { id: 871, geom_dist: 239.31776433927 },
    trafficSignals: [{ px: 1390 }],
  };
  PoiDAO.byCentrelineSummary.mockResolvedValue(poiResponse);

  const counts = [{
    id: 36781,
    legacy: true,
    studyType: StudyType.TMC,
    hours: StudyHours.SCHOOL,
    date: DateTime.fromSQL('2018-02-27 00:00:00'),
    notes: null,
    countLocationId: 5074,
    direction: null,
    extraMetadata: { arteryCode: 5074, stationCode: '0013464586' },
  }];
  const studyData = new Map([[36781, countData_5_36781]]);
  StudyDataDAO.byStudy.mockResolvedValue({ countLocation, counts, studyData });
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineId: 13464586,
    centrelineType: CentrelineType.INTERSECTION,
    description: 'Gerrard St E / Sumach St',
    geom: {
      type: 'Point',
      coordinates: [-79.361498301, 43.663158537],
    },
  });
}

function setup_5_38661() {
  const study = {
    legacy: true,
    countLocationId: 4117,
    studyType: StudyType.TMC,
    countGroupId: 38661,
    startDate: DateTime.fromSQL('2019-04-13 00:00:00'),
    endDate: DateTime.fromSQL('2019-04-13 00:00:00'),
    duration: null,
    daysOfWeek: [6],
    hours: StudyHours.ROUTINE,
    centrelineId: 13456854,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.343625497, 43.70747321],
    },
  };
  StudyDAO.byStudyTypeAndCountGroup.mockResolvedValue(study);

  const countLocation = {
    id: 4117,
    legacy: true,
    description: 'OVERLEA BLVD AT THORNCLIFFE PARK DR & E TCS (PX 679)',
    centrelineId: 13456854,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.343625497, 43.70747321],
    },
  };
  const counts = [{
    id: 38661,
    legacy: true,
    studyType: StudyType.TMC,
    hours: StudyHours.ROUTINE,
    date: DateTime.fromSQL('2019-04-13 00:00:00'),
    notes: null,
    countLocationId: 4117,
    direction: null,
    extraMetadata: { arteryCode: 4117, stationCode: '0013456854' },
  }];
  const studyData = new Map([[38661, countData_5_38661]]);
  StudyDataDAO.byStudy.mockResolvedValue({ countLocation, counts, studyData });
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineId: 13456854,
    centrelineType: CentrelineType.INTERSECTION,
    description: 'Overlea Blvd / Thorncliffe Park Dr',
    geom: {
      type: 'Point',
      coordinates: [-79.343625497, 43.70747321],
    },
  });
  const poiResponse = {
    hospital: null,
    school: { id: 741, geom_dist: 211.268629431655 },
    trafficSignals: [{ px: 680 }],
  };
  PoiDAO.byCentrelineSummary.mockResolvedValue(poiResponse);
  CentrelineDAO.featuresIncidentTo.mockResolvedValue([
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
  ]);
}

function getNumPages(doc) {
  const range = doc.bufferedPageRange();
  return range.start + range.count;
}

test('COUNT_SUMMARY_24H', async () => {
  setup_4_2156283_single();

  const reportInstance = ReportFactory.getInstance(ReportType.COUNT_SUMMARY_24H);
  const doc = await reportInstance.generate('ATR_SPEED_VOLUME/2156283', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(2);
});

test('COUNT_SUMMARY_24H_DETAILED', async () => {
  setup_4_2156283_single();

  const reportInstance = ReportFactory.getInstance(ReportType.COUNT_SUMMARY_24H_DETAILED);
  const doc = await reportInstance.generate('ATR_SPEED_VOLUME/2156283', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(2);
});

test('COUNT_SUMMARY_24H_GRAPHICAL', async () => {
  setup_4_2156283_single();

  const reportInstance = ReportFactory.getInstance(ReportType.COUNT_SUMMARY_24H_GRAPHICAL);
  const doc = await reportInstance.generate('ATR_SPEED_VOLUME/2156283', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(2);
});

test('COUNT_SUMMARY_TURNING_MOVEMENT', async () => {
  setup_5_36781();

  const reportInstance = ReportFactory.getInstance(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT);
  const doc = await reportInstance.generate('TMC/36781', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(2);
});

test('COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED', async () => {
  setup_5_36781();

  const reportInstance = ReportFactory.getInstance(
    ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED,
  );
  const doc = await reportInstance.generate('TMC/36781', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(4);
});

test('INTERSECTION_SUMMARY', async () => {
  setup_5_38661();

  const reportInstance = ReportFactory.getInstance(ReportType.INTERSECTION_SUMMARY);
  const doc = await reportInstance.generate('TMC/38661', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(2);
});

test('SPEED_PERCENTILE', async () => {
  setup_4_2156283_single();

  const reportInstance = ReportFactory.getInstance(ReportType.SPEED_PERCENTILE);
  const doc = await reportInstance.generate('ATR_SPEED_VOLUME/2156283', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(2);
});

test('WARRANT_TRAFFIC_SIGNAL_CONTROL', async () => {
  setup_5_38661();

  const reportInstance = ReportFactory.getInstance(ReportType.WARRANT_TRAFFIC_SIGNAL_CONTROL);
  const doc = await reportInstance.generate('TMC/38661', ReportFormat.PDF, {
    adequateTrial: true,
    isTwoLane: null,
    isXIntersection: null,
    preventablesByYear: [3, 5, 10],
    startDate: DateTime.fromObject({ year: 2012, month: 4, day: 1 }),
  });
  expect(getNumPages(doc)).toBe(3);
});
