/* eslint-disable camelcase */
import path from 'path';

import {
  CardinalDirection,
  CentrelineType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';

function mapTmcCountData(countData) {
  return countData.map(({ t, ...rest }) => {
    const start = t.minus({ minutes: 15 });
    return { t: start, ...rest };
  });
}

function setup_4_2156283() {
  const countData_4_2156283 = loadJsonSync(
    path.resolve(__dirname, 'countData_4_2156283.json'),
  );

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
  const countLocation = {
    id: 2946,
    legacy: true,
    description: 'MORNINGSIDE AVE S OF LAWRENCE AVE',
    centrelineId: 108387,
    centrelineType: CentrelineType.SEGMENT,
  };
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

  return {
    countLocation,
    counts,
    study,
    studyData,
  };
}

function setup_5_34621_directional() {
  const countData_5_34621 = loadJsonSync(
    path.join(__dirname, 'countData_5_34621.json'),
  );
  const countData = mapTmcCountData(countData_5_34621);

  const study = {
    legacy: true,
    countLocationId: 14944,
    studyType: StudyType.TMC,
    countGroupId: 34621,
    startDate: DateTime.fromSQL('2016-11-02 00:00:00'),
    endDate: DateTime.fromSQL('2016-11-02 00:00:00'),
    duration: null,
    daysOfWeek: [3],
    hours: StudyHours.ROUTINE,
    centrelineId: 13448440,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.4765905, 43.76431897],
    },
  };
  const countLocation = {
    id: 14944,
    legacy: true,
    description: 'CHAMPAGNE DR AT CHESSWOOD DR',
    centrelineId: 13448440,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.4765905, 43.76431897],
    },
  };
  const count = {
    id: 34621,
    legacy: true,
    studyType: StudyType.TMC,
    hours: StudyHours.ROUTINE,
    date: DateTime.fromSQL('2016-11-02 00:00:00'),
    notes: null,
    countLocationId: 14944,
    direction: null,
    extraMetadata: { arteryCode: 14944, stationCode: '0013448440' },
  };
  const segments = [
    {
      centrelineId: 9171773,
      geom: {
        type: 'LineString',
        coordinates: [
          [-79.4765905, 43.76431897],
          [-79.477533928, 43.76649159],
        ],
      },
      roadId: 5187,
    },
    {
      centrelineId: 7583524,
      geom: {
        type: 'LineString',
        coordinates: [
          [-79.476483261, 43.762700064],
          [-79.476423874, 43.76281858],
          [-79.476373483, 43.762950716],
          [-79.476348298, 43.763036564],
          [-79.47633396, 43.763112838],
          [-79.476320277, 43.763198563],
          [-79.476309509, 43.763259661],
          [-79.476302334, 43.763345153],
          [-79.476303158, 43.763457669],
          [-79.476321186, 43.763564013],
          [-79.476342818, 43.763694734],
          [-79.476380152, 43.763819624],
          [-79.4765905, 43.76431897],
        ],
      },
      roadId: 5187,
    },
    {
      centrelineId: 7576548,
      geom: {
        type: 'LineString',
        coordinates: [
          [-79.47148067, 43.767826452],
          [-79.471497919, 43.767700188],
          [-79.471443744, 43.767531043],
          [-79.471262034, 43.76706857],
          [-79.47094233, 43.766299491],
          [-79.470928434, 43.766270172],
          [-79.470901253, 43.766181423],
          [-79.470892083, 43.76609232],
          [-79.470886666, 43.765996404],
          [-79.470879945, 43.765902188],
          [-79.470893887, 43.765791524],
          [-79.470935546, 43.765741247],
          [-79.47097724, 43.765670832],
          [-79.47106055, 43.765610493],
          [-79.471171636, 43.765540096],
          [-79.471296606, 43.765499883],
          [-79.471456728, 43.765453044],
          [-79.473202842, 43.765070197],
          [-79.475758176, 43.764511087],
          [-79.4765905, 43.76431897],
        ],
      },
      roadId: 5164,
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
    countData,
    intersection: countLocation,
    segments,
    study,
  };
}

function setup_5_36781() {
  const countData_5_36781 = loadJsonSync(
    path.resolve(__dirname, 'countData_5_36781.json'),
  );
  const countData = mapTmcCountData(countData_5_36781);

  const study = {
    legacy: true,
    countLocationId: 5074,
    studyType: StudyType.TMC,
    countGroupId: 36781,
    startDate: DateTime.fromSQL('2018-02-27 00:00:00'),
    endDate: DateTime.fromSQL('2018-02-27 00:00:00'),
    duration: null,
    daysOfWeek: [2],
    hours: StudyHours.ROUTINE,
    centrelineId: 13464586,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.3614980028034, 43.6631579996018],
    },
  };
  const countLocation = {
    id: 5074,
    legacy: true,
    description: 'GERRARD ST AT SUMACH ST (PX 1390)',
    centrelineId: 13464586,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.3614980028034, 43.6631579996018],
    },
  };
  const counts = [{
    id: 36781,
    legacy: true,
    studyType: StudyType.TMC,
    hours: StudyHours.ROUTINE,
    date: DateTime.fromSQL('2018-02-27 00:00:00'),
    notes: null,
    countLocationId: 5074,
    direction: null,
    extraMetadata: { arteryCode: 5074, stationCode: '0013464586' },
  }];
  const studyData = new Map([[36781, countData]]);

  return {
    countLocation,
    counts,
    study,
    studyData,
  };
}

function setup_5_38661_directional() {
  const countData_5_38661 = loadJsonSync(
    path.join(__dirname, 'countData_5_38661.json'),
  );
  const countData = mapTmcCountData(countData_5_38661);

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
      coordinates: [-79.3436250025741, 43.7074729970241],
    },
  };
  const countLocation = {
    id: 4117,
    legacy: true,
    description: 'OVERLEA BLVD AT THORNCLIFFE PARK DR & E TCS (PX 679)',
    centrelineId: 13456854,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.3436250025741, 43.7074729970241],
    },
  };
  const count = {
    id: 38661,
    legacy: true,
    studyType: StudyType.TMC,
    hours: StudyHours.ROUTINE,
    date: DateTime.fromSQL('2019-04-13 00:00:00'),
    notes: null,
    countLocationId: 4117,
    direction: null,
    extraMetadata: { arteryCode: 4117, stationCode: '0013456854' },
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
    countData,
    intersection: countLocation,
    segments,
    study,
  };
}

/**
 * @namespace
 */
const SetupTestData = {
  setup_4_2156283,
  setup_5_34621_directional,
  setup_5_36781,
  setup_5_38661_directional,
};

export {
  SetupTestData as default,
  setup_4_2156283,
  setup_5_34621_directional,
  setup_5_36781,
  setup_5_38661_directional,
};
