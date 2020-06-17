import {
  AuthScope,
  CardinalDirection,
  centrelineKey,
  CentrelineType,
  StudyHours,
  StudyRequestAssignee,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import ArteryDAO from '@/lib/db/ArteryDAO';
import CategoryDAO from '@/lib/db/CategoryDAO';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import DynamicTileDAO from '@/lib/db/DynamicTileDAO';
import PoiDAO from '@/lib/db/PoiDAO';
import StudyDAO from '@/lib/db/StudyDAO';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import UserDAO from '@/lib/db/UserDAO';
import {
  InvalidCentrelineTypeError,
  InvalidDynamicTileLayerError,
  InvalidStudyQueryError,
} from '@/lib/error/MoveErrors';
import Category from '@/lib/model/Category';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import DAOTestUtils from '@/lib/test/DAOTestUtils';
import {
  generateEmail,
  generateName,
  generateUniqueName,
  generateUser,
} from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';

beforeAll(DAOTestUtils.startupWithDevData, DAOTestUtils.TIMEOUT);
afterAll(DAOTestUtils.shutdown, DAOTestUtils.TIMEOUT);

test('ArteryDAO.getApproachDirection', async () => {
  expect(ArteryDAO.getApproachDirection('')).toBe(null);
  expect(ArteryDAO.getApproachDirection(null)).toBe(null);
  expect(ArteryDAO.getApproachDirection('invalid-direction')).toBe(null);

  expect(ArteryDAO.getApproachDirection('N')).toBe(CardinalDirection.NORTH);
  expect(ArteryDAO.getApproachDirection('E')).toBe(CardinalDirection.EAST);
  expect(ArteryDAO.getApproachDirection('S')).toBe(CardinalDirection.SOUTH);
  expect(ArteryDAO.getApproachDirection('W')).toBe(CardinalDirection.WEST);
});

test('ArteryDAO.byArteryCode', async () => {
  // intersection
  let result = await ArteryDAO.byArteryCode(1146);
  expect(result).toEqual({
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
  expect(result).toEqual({
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

test('CategoryDAO', async () => {
  expect(CategoryDAO.isInited()).toBe(false);

  let category = await CategoryDAO.byId(1);
  expect(category.id).toBe(1);
  expect(category.studyType).toBe(StudyType.ATR_VOLUME);
  await expect(
    Category.read.validateAsync(category),
  ).resolves.toEqual(category);
  expect(CategoryDAO.isInited()).toBe(true);

  category = await CategoryDAO.byId(-1);
  expect(category).toBeUndefined();

  await expect(CategoryDAO.all()).resolves.toBeInstanceOf(Map);
});

test('CentrelineDAO.byIdAndType()', async () => {
  // intersection
  let result = await CentrelineDAO.byIdAndType(30000549, CentrelineType.INTERSECTION);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toEqual(30000549);
  expect(result.centrelineType).toEqual(CentrelineType.INTERSECTION);

  // segment
  result = await CentrelineDAO.byIdAndType(111569, CentrelineType.SEGMENT);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toEqual(111569);
  expect(result.centrelineType).toEqual(CentrelineType.SEGMENT);

  // invalid ID and type
  await expect(
    CentrelineDAO.byIdAndType(-1, -1),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // invalid ID, valid type
  await expect(
    CentrelineDAO.byIdAndType(-1, CentrelineType.SEGMENT),
  ).resolves.toBeNull();
});

function expectIdsAndTypesResult(results, { centrelineId, centrelineType }) {
  const key = centrelineKey(centrelineType, centrelineId);
  expect(results.has(key)).toBe(true);
  const result = results.get(key);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toBe(centrelineId);
  expect(result.centrelineType).toBe(centrelineType);
}

function expectIdsAndTypesResults(results, expected) {
  expect(results.size).toBe(expected.length);
  expected.forEach((expectedResult) => {
    expectIdsAndTypesResult(results, expectedResult);
  });
}

test('CentrelineDAO.byIdsAndTypes()', async () => {
  // empty
  let query = [];
  let results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);

  // invalid
  query = [
    { centrelineId: -1, centrelineType: -1 },
  ];
  expect(CentrelineDAO.byIdsAndTypes(query)).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // single valid intersection
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);

  // single valid segment
  query = [
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);

  // duplicate value
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, [query[0]]);

  // intersection + segment
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);
});

function expectSuggestionsContain(result, centrelineId) {
  const suggestedIds = result.map(({ centrelineId: suggestedId }) => suggestedId);
  expect(suggestedIds).toContain(centrelineId);
}

test('CentrelineDAO.intersectionSuggestions', async () => {
  // full query should match
  let result = await CentrelineDAO.intersectionSuggestions('Danforth and Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial query should match
  result = await CentrelineDAO.intersectionSuggestions('Danforth and Mai', 3);
  expectSuggestionsContain(result, 13460034);

  // either term can be prefixed
  result = await CentrelineDAO.intersectionSuggestions('Dan and Main', 3);
  expectSuggestionsContain(result, 13460034);

  // full query with minor typo should match
  result = await CentrelineDAO.intersectionSuggestions('Damforth and Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial query with minor typo should match
  result = await CentrelineDAO.intersectionSuggestions('Damforth and Mai', 3);
  expectSuggestionsContain(result, 13460034);

  // full queries: 'and' is optional
  result = await CentrelineDAO.intersectionSuggestions('Danforth Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial queries: 'and' is optional
  result = await CentrelineDAO.intersectionSuggestions('Danforth Mai', 3);
  expectSuggestionsContain(result, 13460034);

  // full queries: punctuation ignored
  result = await CentrelineDAO.intersectionSuggestions('Danforth & Main', 3);
  expectSuggestionsContain(result, 13460034);

  // partial queries: punctuation ignored
  result = await CentrelineDAO.intersectionSuggestions('Danforth / Mai', 3);
  expectSuggestionsContain(result, 13460034);
});

test('CentrelineDAO.featuresIncidentTo', async () => {
  // 4-way intersection
  let result = await CentrelineDAO.featuresIncidentTo(CentrelineType.INTERSECTION, 13463436);
  expect(result).toHaveLength(4);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.SEGMENT);
  });

  // 3-way intersection
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.INTERSECTION, 13459232);
  expect(result).toHaveLength(3);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.SEGMENT);
  });

  // 5-way intersection
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.INTERSECTION, 13463551);
  expect(result).toHaveLength(5);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.SEGMENT);
  });

  // segment
  result = await CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, 111569);
  expect(result).toHaveLength(2);
  result.forEach(({ centrelineType }) => {
    expect(centrelineType).toBe(CentrelineType.INTERSECTION);
  });

  // invalid ID and type
  await expect(
    CentrelineDAO.featuresIncidentTo(-1, -1),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);

  // invalid ID, valid type
  await expect(
    CentrelineDAO.featuresIncidentTo(CentrelineType.SEGMENT, -1),
  ).resolves.toEqual([]);
});

test('CollisionDAO.byCollisionId', async () => {
  // invalid ID
  let result = await CollisionDAO.byCollisionId(-1);
  expect(result).toBeNull();

  result = await CollisionDAO.byCollisionId(1040350);
  expect(result).not.toBeNull();
  expect(result.centrelineId).toBe(1142194);
  expect(result.centrelineType).toBe(CentrelineType.SEGMENT);
  expect(result.involved).toHaveLength(2);
});

test('CollisionDAO.byCentreline', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let result = await CollisionDAO.byCentreline({
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toHaveLength(31);

  result = await CollisionDAO.byCentreline({
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toHaveLength(27);
});

test('CollisionDAO.byCentrelineSummary', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let result = await CollisionDAO.byCentrelineSummary({
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toEqual({ amount: 31, ksi: 0, validated: 26 });

  result = await CollisionDAO.byCentrelineSummary({
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    dateRangeEnd,
    dateRangeStart,
    daysOfWeek: null,
    emphasisAreas: null,
    roadSurfaceConditions: null,
  });
  expect(result).toEqual({ amount: 27, ksi: 1, validated: 16 });
});

test('CollisionDAO.byCentrelineTotal', async () => {
  let result = await CollisionDAO.byCentrelineTotal(CentrelineType.SEGMENT, 1142194);
  expect(result).toBe(212);

  result = await CollisionDAO.byCentrelineTotal(CentrelineType.INTERSECTION, 13465434);
  expect(result).toBe(188);
});

test('CollisionFactorDAO', async () => {
  expect(CollisionFactorDAO.isInited()).toBe(false);

  const collisionFactors = await CollisionFactorDAO.all();
  expect(collisionFactors).toBeInstanceOf(Map);
  expect(collisionFactors.get('acclass')).toBeInstanceOf(Map);
  expect(collisionFactors.get('acclass').get(1)).toEqual({
    code: 'FA',
    description: 'Fatal',
  });
  expect(CollisionFactorDAO.isInited()).toBe(true);
});

test('DynamicTileDAO.getTileInfo', () => {
  const { EPSG_3857_MAX, EPSG_3857_MIN, EPSG_3857_SIZE } = DynamicTileDAO;
  const res = EPSG_3857_SIZE / 4096;

  expect(DynamicTileDAO.getTileInfo(0, 0, 0)).toEqual({
    bmin: -256,
    bmax: 4352,
    xmin: EPSG_3857_MIN,
    xmax: EPSG_3857_MAX,
    ymin: EPSG_3857_MIN,
    ymax: EPSG_3857_MAX,
    res,
    fx: 1 / res,
    fy: -1 / res,
    xoff: -EPSG_3857_MIN / res,
    yoff: EPSG_3857_MAX / res,
  });
});

function expectValidTileFeature(tileFeature) {
  // all features must have numeric IDs
  expect(tileFeature).toHaveProperty('id');
  expect(typeof tileFeature.id).toBe('number');

  // all features are expected to have `geom` field
  expect(tileFeature).toHaveProperty('geom');

  // `geom` field must be a GeoJSON point with integer coordinates
  expect(tileFeature.geom.type).toEqual('Point');
  expect(tileFeature.geom.coordinates).toHaveLength(2);
  expect(Number.isInteger(tileFeature.geom.coordinates[0])).toBe(true);
  expect(Number.isInteger(tileFeature.geom.coordinates[1])).toBe(true);
}

test('DynamicTileDAO.getTileFeatures', async () => {
  // non-existent layer
  await expect(
    DynamicTileDAO.getTileFeatures('noSuchLayer'),
  ).rejects.toBeInstanceOf(InvalidDynamicTileLayerError);

  // parameterized layer with invalid parameter
  await expect(
    DynamicTileDAO.getTileFeatures('collisionsLevel1'),
  ).rejects.toBeInstanceOf(InvalidDynamicTileLayerError);
  await expect(
    DynamicTileDAO.getTileFeatures('studies:blarghl'),
  ).rejects.toBeInstanceOf(InvalidDynamicTileLayerError);

  // tile outside city boundaries
  await expect(
    DynamicTileDAO.getTileFeatures('hospitalsLevel1', 12, 345, 678),
  ).resolves.toHaveLength(0);

  // tile with features
  const tileFeatures = await DynamicTileDAO.getTileFeatures('collisionsLevel1:3', 17, 36617, 47827);
  expect(tileFeatures.length).toBeGreaterThan(0);
  tileFeatures.forEach(expectValidTileFeature);
});

test('PoiDAO.byCentrelineSummary', async () => {
  let result = await PoiDAO.byCentrelineSummary(1142194, CentrelineType.SEGMENT);
  expect(result).toHaveProperty('hospital');
  expect(result).toHaveProperty('school');

  result = await PoiDAO.byCentrelineSummary(13465434, CentrelineType.INTERSECTION);
  expect(result).toHaveProperty('hospital');
  expect(result).toHaveProperty('school');
});

// START STUDY

test('StudyDAO.byCentreline()', async () => {
  // invalid feature
  let studyQuery = {
    centrelineId: -1,
    centrelineType: -1,
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  let studies = await StudyDAO.byCentreline(studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(0);

  // invalid date range (start > end)
  studyQuery = {
    centrelineId: 30000549,
    centrelineType: CentrelineType.INTERSECTION,
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  await expect(
    StudyDAO.byCentreline(studyQuery, { limit: 10, offset: 0 }),
  ).rejects.toBeInstanceOf(InvalidStudyQueryError);

  // valid feature with less than 10 counts
  studyQuery = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  studies = await StudyDAO.byCentreline(studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(2);
  await expect(
    Joi.array().items(Study.read).validateAsync(studies),
  ).resolves.toEqual(studies);
  expect(studies[0].duration).toBe(72);
  expect(studies[0].hours).toBeNull();
  expect(studies[1].duration).toBe(72);
  expect(studies[1].hours).toBeNull();

  // valid feature with less than 10 counts, date range filters to empty
  studyQuery = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  studies = await StudyDAO.byCentreline(studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(0);

  // valid feature with more than 10 counts
  studyQuery = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.RESCU],
  };
  studies = await StudyDAO.byCentreline(studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(10);

  // valid feature with more than 10 counts, date range filters to less
  studyQuery = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd: DateTime.fromObject({ year: 2015, month: 4, day: 15 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 4, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.RESCU],
  };
  studies = await StudyDAO.byCentreline(studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(8);

  // pagination works
  studyQuery = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.RESCU],
  };
  const studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  const { n } = studySummary[0];
  for (let offset = 0; offset < n; offset += 100) {
    /* eslint-disable-next-line no-await-in-loop */
    studies = await StudyDAO.byCentreline(studyQuery, { limit: 100, offset });
    const expectedLength = Math.min(100, n - offset);
    expect(studies).toHaveLength(expectedLength);
  }
});

function expectNumPerCategoryStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([n0, value0], i) => {
    const { category: { studyType: { name: value } }, n } = actual[i];
    expect(n).toBe(n0);
    expect(value).toBe(value0);
  });
}

test('StudyDAO.byCentrelineSummary()', async () => {
  // invalid feature
  let studyQuery = {
    centrelineId: -1,
    centrelineType: -1,
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  let studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // invalid date range (start > end)
  studyQuery = {
    centrelineId: 30000549,
    centrelineType: CentrelineType.INTERSECTION,
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  await expect(
    StudyDAO.byCentrelineSummary(studyQuery),
  ).rejects.toBeInstanceOf(InvalidStudyQueryError);

  // centreline feature with no counts
  studyQuery = {
    centrelineId: 30062737,
    centrelineType: CentrelineType.SEGMENT,
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // centreline feature with some counts
  studyQuery = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  const studySummarySchema = Joi.array().items(
    Joi.object().keys({
      category: Category.read,
      mostRecent: Study.read,
      n: Joi.number().integer().positive().required(),
    }),
  );
  expectNumPerCategoryStudy(studySummary, [[4, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);
  await expect(
    studySummarySchema.validateAsync(studySummary),
  ).resolves.toEqual(studySummary);

  // valid feature with some counts, date range filters to empty
  studyQuery = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // centreline feature with lots of counts
  studyQuery = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  expectNumPerCategoryStudy(studySummary, [[3633, 'RESCU']]);

  // centreline feature with lots of counts, date range filters to empty
  studyQuery = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd: DateTime.fromObject({ year: 1980, month: 1, day: 2 }),
    dateRangeStart: DateTime.fromObject({ year: 1980, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // centreline feature with lots of counts, date range filters down
  studyQuery = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    dateRangeEnd: DateTime.fromObject({ year: 2016, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  expectNumPerCategoryStudy(studySummary, [[187, 'RESCU']]);

  // centreline feature with more than one kind of count
  studyQuery = {
    centrelineId: 9278884,
    centrelineType: CentrelineType.SEGMENT,
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(studyQuery);
  expectNumPerCategoryStudy(studySummary, [[1, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);
});

test('StudyDAO.byCentrelineTotal()', async () => {
  // invalid feature
  let total = await StudyDAO.byCentrelineTotal(-1, -1);
  expect(total).toBe(0);

  // centreline feature with no counts
  total = await StudyDAO.byCentrelineTotal(CentrelineType.SEGMENT, 30062737);
  expect(total).toBe(0);

  // centreline feature with some counts
  total = await StudyDAO.byCentrelineTotal(CentrelineType.SEGMENT, 14659630);
  expect(total).toBe(6);

  // centreline feature with lots of counts
  total = await StudyDAO.byCentrelineTotal(CentrelineType.SEGMENT, 1145768);
  expect(total).toBe(3633);

  // centreline feature with more than one kind of count
  total = await StudyDAO.byCentrelineTotal(CentrelineType.SEGMENT, 9278884);
  expect(total).toBe(3);
});

// END STUDY

test('StudyRequestDAO', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  const now = DateTime.local();
  const transientStudyRequest = {
    serviceRequestId: null,
    urgent: false,
    urgentReason: null,
    assignedTo: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reasons: [StudyRequestReason.TSC, StudyRequestReason.PED_SAFETY],
    ccEmails: [],
    studyType: StudyType.TMC,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: StudyHours.ROUTINE,
    notes: 'completely normal routine turning movement count',
    centrelineId: 1729,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
  };

  // generate second user for multi-user updates
  const transientUser2 = generateUser();
  const persistedUser2 = await UserDAO.create(transientUser2);

  // save study request
  let persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, persistedUser);
  expect(persistedStudyRequest.id).not.toBeNull();
  expect(persistedStudyRequest.userId).toBe(persistedUser.id);
  expect(persistedStudyRequest.status).toBe(StudyRequestStatus.REQUESTED);
  expect(persistedStudyRequest.closed).toBe(false);
  await expect(
    StudyRequest.read.validateAsync(persistedStudyRequest),
  ).resolves.toEqual(persistedStudyRequest);

  // fetch saved study request
  let fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // fetch by centreline
  let fetchedStudyRequests = await StudyRequestDAO.byCentreline(
    1729,
    CentrelineType.INTERSECTION,
  );
  expect(fetchedStudyRequests).toEqual([persistedStudyRequest]);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending(
    1729,
    CentrelineType.INTERSECTION,
  );
  expect(fetchedStudyRequests).toEqual([persistedStudyRequest]);

  // fetch by user
  let byUser = await StudyRequestDAO.byUser(persistedUser);
  expect(byUser).toEqual([persistedStudyRequest]);

  // fetch all
  let all = await StudyRequestDAO.all();
  expect(all).toEqual([persistedStudyRequest]);

  // update study request fields
  persistedStudyRequest.reasons = ['TSC'];
  persistedStudyRequest.serviceRequestId = '12345';

  // update existing study fields
  persistedStudyRequest.daysOfWeek = [3, 4];
  persistedStudyRequest.hours = StudyHours.SCHOOL;
  persistedStudyRequest.notes = 'oops, this is actually a school count';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // set as urgent with second user
  persistedStudyRequest.urgent = true;
  persistedStudyRequest.urgentReason = 'because I said so';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser2);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser2.id);

  // close with first user
  persistedStudyRequest.closed = true;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // fetch by centreline
  fetchedStudyRequests = await StudyRequestDAO.byCentreline(
    1729,
    CentrelineType.INTERSECTION,
  );
  expect(fetchedStudyRequests).toEqual([persistedStudyRequest]);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending(
    1729,
    CentrelineType.INTERSECTION,
  );
  expect(fetchedStudyRequests).toEqual([]);

  // reopen
  persistedStudyRequest.closed = false;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // change study details
  persistedStudyRequest.studyType = StudyType.TMC;
  persistedStudyRequest.daysOfWeek = [0, 6];
  persistedStudyRequest.duration = null;
  persistedStudyRequest.hours = StudyHours.OTHER;
  persistedStudyRequest.notes = 'complete during shopping mall peak hours';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // delete study request
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(true);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toBeNull();

  // fetch by centreline
  fetchedStudyRequests = await StudyRequestDAO.byCentreline(
    1729,
    CentrelineType.INTERSECTION,
  );
  expect(fetchedStudyRequests).toEqual([]);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending(
    1729,
    CentrelineType.INTERSECTION,
  );
  expect(fetchedStudyRequests).toEqual([]);

  // delete: should not work again
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(false);

  // fetch by user
  byUser = await StudyRequestDAO.byUser(persistedUser);
  expect(byUser).toEqual([]);

  // fetch all
  all = await StudyRequestDAO.all();
  expect(all).toEqual([]);
});

test('StudyRequestChangeDAO', async () => {
  await expect(StudyRequestChangeDAO.byId(-1)).resolves.toBeNull();

  const transientUser1 = generateUser();
  const persistedUser1 = await UserDAO.create(transientUser1);
  const now = DateTime.local();
  const transientStudyRequest = {
    serviceRequestId: '12345',
    urgent: false,
    urgentReason: null,
    assignedTo: StudyRequestAssignee.FIELD_STAFF,
    dueDate: now.plus({ months: 4 }),
    estimatedDeliveryDate: now.plus({ months: 3, weeks: 3 }),
    reasons: [StudyRequestReason.TSC, StudyRequestReason.PED_SAFETY],
    ccEmails: [],
    studyType: StudyType.TMC,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: StudyHours.ROUTINE,
    notes: 'completely normal routine turning movement count',
    centrelineId: 42,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
  };
  const persistedStudyRequest = await StudyRequestDAO.create(
    transientStudyRequest,
    persistedUser1,
  );

  const transientUser2 = generateUser();
  const persistedUser2 = await UserDAO.create(transientUser2);

  // save change 1
  persistedStudyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
  const persistedChange1 = await StudyRequestChangeDAO.create(
    persistedStudyRequest,
    persistedUser1,
  );
  expect(persistedChange1.id).not.toBeNull();
  await expect(
    StudyRequestChange.read.validateAsync(persistedChange1),
  ).resolves.toEqual(persistedChange1);

  // fetch saved change
  const fetchedChange1 = await StudyRequestChangeDAO.byId(persistedChange1.id);
  expect(fetchedChange1).toEqual(persistedChange1);

  // fetch by study request
  let byStudyRequest = await StudyRequestChangeDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedChange1]);

  // save change 2
  persistedStudyRequest.status = StudyRequestStatus.ASSIGNED;
  const persistedChange2 = await StudyRequestChangeDAO.create(
    persistedStudyRequest,
    persistedUser2,
  );
  expect(persistedChange2.id).not.toBeNull();

  // fetch by study request: returns most recent first
  byStudyRequest = await StudyRequestChangeDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedChange2, persistedChange1]);

  // delete study request: should delete all changes
  await StudyRequestDAO.delete(persistedStudyRequest);
  byStudyRequest = await StudyRequestChangeDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([]);
});

test('StudyRequestCommentDAO', async () => {
  await expect(StudyRequestCommentDAO.byId(-1)).resolves.toBeNull();

  const user1 = generateUser();
  const userCreated1 = await UserDAO.create(user1);
  const now = DateTime.local();
  const transientStudyRequest = {
    serviceRequestId: '12345',
    urgent: false,
    urgentReason: null,
    assignedTo: StudyRequestAssignee.FIELD_STAFF,
    dueDate: now.plus({ months: 4 }),
    estimatedDeliveryDate: now.plus({ months: 3, weeks: 3 }),
    reasons: [StudyRequestReason.TSC, StudyRequestReason.PED_SAFETY],
    ccEmails: [],
    studyType: StudyType.TMC,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: StudyHours.ROUTINE,
    notes: 'completely normal routine turning movement count',
    centrelineId: 42,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
  };
  const persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, userCreated1);

  const user2 = generateUser();
  const userCreated2 = await UserDAO.create(user2);

  const transientComment1 = {
    comment: 'We don\'t normally do this study here.',
  };
  const transientComment2 = {
    comment: 'I believe we have already done this study before.',
  };

  // save comment 1
  let persistedComment1 = await StudyRequestCommentDAO.create(
    transientComment1,
    persistedStudyRequest,
    userCreated1,
  );
  expect(persistedComment1.id).not.toBeNull();
  await expect(
    StudyRequestComment.read.validateAsync(persistedComment1),
  ).resolves.toEqual(persistedComment1);

  // fetch saved comment
  let fetchedComment1 = await StudyRequestCommentDAO.byId(persistedComment1.id);
  expect(fetchedComment1).toEqual(persistedComment1);

  // fetch by study request
  let byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedComment1]);

  // update comment
  persistedComment1.comment = 'Yes, we\'ve done this already here.';
  persistedComment1 = await StudyRequestCommentDAO.update(persistedComment1);
  fetchedComment1 = await StudyRequestCommentDAO.byId(persistedComment1.id);
  expect(fetchedComment1).toEqual(persistedComment1);

  // save comment 2
  const persistedComment2 = await StudyRequestCommentDAO.create(
    transientComment2,
    persistedStudyRequest,
    userCreated2,
  );
  expect(persistedComment2.id).not.toBeNull();

  // fetch by study request: returns most recent first
  byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedComment2, persistedComment1]);

  // delete comment 1
  await expect(StudyRequestCommentDAO.delete(persistedComment1)).resolves.toBe(true);
  byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedComment2]);

  // delete comment 1: should not work again
  await expect(StudyRequestCommentDAO.delete(persistedComment1)).resolves.toBe(false);

  // delete study request: should delete all comments
  await StudyRequestDAO.delete(persistedStudyRequest);
  byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([]);
});

test('UserDAO', async () => {
  const transientUser1 = generateUser();
  const transientUser2 = generateUser();

  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toBeNull();
  await expect(UserDAO.bySub(transientUser2.sub)).resolves.toBeNull();

  const persistedUser1 = await UserDAO.create(transientUser1);
  expect(persistedUser1.sub).toEqual(transientUser1.sub);
  await expect(UserDAO.byId(persistedUser1.id)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.bySub(transientUser2.sub)).resolves.toBeNull();
  await expect(UserDAO.byEmail(transientUser1.email)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.all()).resolves.toContainEqual(persistedUser1);

  const name = generateName();
  const email = generateEmail(name);
  const uniqueName = generateUniqueName(name);
  Object.assign(persistedUser1, { email, uniqueName });
  await expect(UserDAO.update(persistedUser1)).resolves.toEqual(persistedUser1);
  Object.assign(persistedUser1, {
    scope: [AuthScope.STUDY_REQUESTS, AuthScope.STUDY_REQUESTS_EDIT],
  });
  await expect(UserDAO.update(persistedUser1)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toEqual(persistedUser1);

  let users = await UserDAO.byIds([]);
  expect(users.size).toBe(0);

  users = await UserDAO.byIds([persistedUser1.id]);
  expect(users.size).toBe(1);
  expect(users.get(persistedUser1.id)).toEqual(persistedUser1);

  const persistedUser2 = await UserDAO.create(transientUser2);
  users = await UserDAO.byIds([persistedUser1.id, persistedUser2.id]);
  expect(users.size).toBe(2);
  expect(users.get(persistedUser1.id)).toEqual(persistedUser1);
  expect(users.get(persistedUser2.id)).toEqual(persistedUser2);
  await expect(UserDAO.all()).resolves.toContainEqual(persistedUser2);

  await expect(UserDAO.delete(persistedUser1)).resolves.toEqual(true);
  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toBeNull();
  await expect(UserDAO.all()).resolves.not.toContainEqual(persistedUser1);
});
