/* eslint-disable camelcase */
import path from 'path';

import {
  CardinalDirection,
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

  const artery = {
    approachDir: CardinalDirection.NORTH,
    arteryCode: 2946,
    stationCode: 2946,
    street1: 'MORNINGSIDE AVE',
  };
  const count = {
    arteryCode: 2946,
    date: DateTime.fromSQL('2019-03-07 00:00:00'),
    id: 17,
    locationDesc: 'MORNINGSIDE AVE N/B S OF LAWRENCE AVE',
    type: { studyType: StudyType.ATR_SPEED_VOLUME },
  };
  const counts = [count];
  const arteries = new Map([[2946, artery]]);
  const studyData = new Map([[17, countData_4_2156283]]);

  return {
    arteries,
    counts,
    study: count,
    studyData,
  };
}

function setup_5_34621_directional() {
  const countData_5_34621 = loadJsonSync(
    path.join(__dirname, 'countData_5_34621.json'),
  );
  const countData = mapTmcCountData(countData_5_34621);

  const count = {
    date: DateTime.fromSQL('2016-11-02 00:00:00'),
    hours: StudyHours.ROUTINE,
    id: 34621,
    locationDesc: 'CHAMPAGNE DR AT CHESSWOOD DR',
  };
  const intersection = {
    geom: {
      type: 'Point',
      coordinates: [-79.4765905, 43.76431897],
    },
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
    intersection,
    segments,
  };
}

function setup_5_36781() {
  const countData_5_36781 = loadJsonSync(
    path.resolve(__dirname, 'countData_5_36781.json'),
  );
  const countData = mapTmcCountData(countData_5_36781);

  const count = {
    date: DateTime.fromSQL('2018-02-27 00:00:00'),
    hours: StudyHours.SCHOOL,
    id: 1,
    locationDesc: 'GERRARD ST AT SUMACH ST (PX 1390)',
    type: { studyType: StudyType.TMC },
  };
  const studyData = new Map([[1, countData]]);

  return {
    count,
    counts: [count],
    studyData,
  };
}

function setup_5_38661_directional() {
  const countData_5_38661 = loadJsonSync(
    path.join(__dirname, 'countData_5_38661.json'),
  );
  const countData = mapTmcCountData(countData_5_38661);

  const count = {
    date: DateTime.fromSQL('2019-04-13 00:00:00'),
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
    countData,
    intersection,
    segments,
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
