import { CardinalDirection, CentrelineType } from '@/lib/Constants';
import db from '@/lib/db/db';
import ArteryDAO from '@/lib/db/ArteryDAO';

afterAll(() => {
  db.$pool.end();
});

function expectArteryMatches(actual, expected) {
  const { geom: geomActual, ...restActual } = actual;
  const { geom: geomExpected, ...restExpected } = expected;
  expect(restActual).toEqual(restExpected);
  expect(geomActual.type).toEqual(geomExpected.type);
  expect(geomActual.coordinates[0]).toBeCloseTo(geomExpected.coordinates[0]);
  expect(geomActual.coordinates[1]).toBeCloseTo(geomExpected.coordinates[1]);
}

function expectArteriesMatch(actual, expected) {
  const n = expected.length;
  expect(actual).toHaveLength(n);
  for (let i = 0; i < n; i++) {
    expectArteryMatches(actual[i], expected[i]);
  }
}

test('ArteryDAO.getApproachDirection', async () => {
  expect(ArteryDAO.getApproachDirection('')).toBe(null);
  expect(ArteryDAO.getApproachDirection(null)).toBe(null);
  expect(ArteryDAO.getApproachDirection('invalid-direction')).toBe(null);

  expect(ArteryDAO.getApproachDirection('N')).toBe(CardinalDirection.NORTH);
  expect(ArteryDAO.getApproachDirection('E')).toBe(CardinalDirection.EAST);
  expect(ArteryDAO.getApproachDirection('S')).toBe(CardinalDirection.SOUTH);
  expect(ArteryDAO.getApproachDirection('W')).toBe(CardinalDirection.WEST);
});

test('ArteryDAO.byArteryCode [invalid]', async () => {
  const result = await ArteryDAO.byArteryCode(-1);
  expect(result).toBeNull();
});

test('ArteryDAO.byArteryCode', async () => {
  // intersection
  let result = await ArteryDAO.byArteryCode(1146);
  expectArteryMatches(result, {
    approachDir: null,
    arteryCode: 1146,
    centrelineId: 13446642,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.246253917, 43.773318767],
    },
    locationDesc: 'ELLESMERE RD AT PARKINGTON CRES (PX 2296)',
    stationCode: '0013446642',
    street1: 'ELLESMERE RD',
    street2: 'PARKINGTON CRES',
    street3: 'PX 2296',
  });

  // segment
  result = await ArteryDAO.byArteryCode(1);
  expectArteryMatches(result, {
    approachDir: CardinalDirection.EAST,
    arteryCode: 1,
    centrelineId: 110795,
    centrelineType: CentrelineType.SEGMENT,
    geom: {
      type: 'Point',
      coordinates: [-79.2289317526363, 43.7396311942705],
    },
    locationDesc: 'ADANAC DR E/B W OF BELLAMY RD',
    stationCode: '1',
    street1: 'ADANAC DR',
    street2: 'BELLAMY RD',
    street3: null,
  });
});

test('ArteryDAO.byStudy', async () => {
  // intersection
  let result = await ArteryDAO.byStudy({
    arteryGroupId: 23945,
  });
  expectArteriesMatch(result, [{
    approachDir: null,
    arteryCode: 23945,
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.41247566, 43.774098393],
    },
    locationDesc: 'CHURCH AVE AT DORIS AVE (PX 1977)',
    stationCode: '0013446886',
    street1: 'CHURCH AVE',
    street2: 'DORIS AVE',
    street3: 'PX 1977',
  }]);

  // segment
  result = await ArteryDAO.byStudy({
    arteryGroupId: 32532,
  });
  expectArteriesMatch(result, [{
    approachDir: CardinalDirection.EAST,
    arteryCode: 32532,
    centrelineId: 9278884,
    centrelineType: CentrelineType.SEGMENT,
    geom: {
      type: 'Point',
      coordinates: [-79.5370597996856, 43.6611516850526],
    },
    locationDesc: 'RATHBURN RD E/B W OF PHEASANT LANE',
    stationCode: '32532',
    street1: 'RATHBURN ROAD',
    street2: 'PHEASANT LANE',
    street3: null,
  }, {
    approachDir: CardinalDirection.WEST,
    arteryCode: 32533,
    centrelineId: 9278884,
    centrelineType: CentrelineType.SEGMENT,
    geom: {
      type: 'Point',
      coordinates: [-79.5370597996856, 43.6611516850526],
    },
    locationDesc: 'RATHBURN RD W/B E OF THE WYND',
    stationCode: '32533',
    street1: 'RATHBURN ROAD',
    street2: 'THE WYND',
    street3: null,
  }]);

  // segment: other artery
  result = await ArteryDAO.byStudy({
    arteryGroupId: 32533,
  });
  expect(result).toEqual([]);
});
