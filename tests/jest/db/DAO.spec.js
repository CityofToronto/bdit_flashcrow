/* eslint-disable camelcase */
import path from 'path';
import uuid from 'uuid/v4';

import {
  CardinalDirection,
  centrelineKey,
  CentrelineType,
} from '@/lib/Constants';
import ArteryDAO from '@/lib/db/ArteryDAO';
import CategoryDAO from '@/lib/db/CategoryDAO';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CountDAO from '@/lib/db/CountDAO';
import CountDataDAO from '@/lib/db/CountDataDAO';
import StudyDAO from '@/lib/db/StudyDAO';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import StudyRequestReasonDAO from '@/lib/db/StudyRequestReasonDAO';
import StudyRequestStatusDAO from '@/lib/db/StudyRequestStatusDAO';
import UserDAO from '@/lib/db/UserDAO';
import {
  InvalidCentrelineTypeError,
} from '@/lib/error/MoveErrors';
import DAOTestUtils from '@/lib/test/DAOTestUtils';
import { loadJsonSync } from '@/lib/test/TestDataLoader';
import DateTime from '@/lib/time/DateTime';

beforeAll(DAOTestUtils.startupWithDevData, DAOTestUtils.TIMEOUT);
afterAll(DAOTestUtils.shutdown, DAOTestUtils.TIMEOUT);

const countData_4_1415698 = loadJsonSync(
  path.resolve(__dirname, './data/countData_4_1415698.json'),
);
const countData_5_26177 = loadJsonSync(
  path.resolve(__dirname, './data/countData_5_26177.json'),
);

test('ArteryDAO.getApproachDirection', async () => {
  expect(ArteryDAO.getApproachDirection('')).toBe(null);
  expect(ArteryDAO.getApproachDirection(null)).toBe(null);
  expect(ArteryDAO.getApproachDirection('invalid-direction')).toBe(null);

  expect(ArteryDAO.getApproachDirection('N')).toBe(CardinalDirection.SOUTH);
  expect(ArteryDAO.getApproachDirection('E')).toBe(CardinalDirection.WEST);
  expect(ArteryDAO.getApproachDirection('S')).toBe(CardinalDirection.NORTH);
  expect(ArteryDAO.getApproachDirection('W')).toBe(CardinalDirection.EAST);
});

test('ArteryDAO.getCombinedStreet', async () => {
  expect(ArteryDAO.getCombinedStreet(null, null, null)).toBe(null);
  expect(ArteryDAO.getCombinedStreet(null, 'Ave', 'W')).toBe(null);

  expect(ArteryDAO.getCombinedStreet(
    'BROWNS LINE',
    null,
    null,
  )).toBe('BROWNS LINE');
  expect(ArteryDAO.getCombinedStreet(
    'ADANAC',
    'DR',
    null,
  )).toBe('ADANAC DR');
  expect(ArteryDAO.getCombinedStreet(
    'DUNDAS',
    'ST',
    'W',
  )).toBe('DUNDAS ST W');

  /*
   * Some of the `ARTERYDATA` entries have spaces in street names.
   */
  expect(ArteryDAO.getCombinedStreet(
    'CACTUS ',
    'AVE',
    null,
  )).toBe('CACTUS AVE');
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
      coordinates: [-79.2289101129868, 43.7396537576817],
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
  expect(category.value).toBe('ATR_VOLUME');
  expect(category.automatic).toBe(true);
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

  // invalid
  expect(CentrelineDAO.byIdAndType(-1, -1)).rejects.toBeInstanceOf(InvalidCentrelineTypeError);
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

test('CountDAO.byCentreline()', async () => {
  // invalid feature
  let counts = await CountDAO.byCentreline(-1, -1, null, 10);
  expect(counts).toHaveLength(0);

  // invalid date range (start > end)
  let start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let end = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  counts = await CountDAO.byCentreline(
    30000549, CentrelineType.INTERSECTION,
    { start, end },
    10,
  );
  expect(counts).toHaveLength(0);

  // valid feature with less than maxPerCategory counts
  counts = await CountDAO.byCentreline(
    14659630, CentrelineType.SEGMENT,
    null,
    10,
  );
  expect(counts).toHaveLength(16);

  // valid feature with less than maxPerCategory counts, date range
  // filters to empty
  start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  counts = await CountDAO.byCentreline(
    14659630, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expect(counts).toHaveLength(0);

  // valid feature with more than maxPerCategory counts
  counts = await CountDAO.byCentreline(
    1145768, CentrelineType.SEGMENT,
    null,
    10,
  );
  expect(counts).toHaveLength(10);

  // valid feature with more than maxPerCategory counts, date range
  // filters to less
  start = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2016, month: 1, day: 1 });
  counts = await CountDAO.byCentreline(
    1145768, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expect(counts).toHaveLength(10);
});

function expectNumPerCategory(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([n0, value0], i) => {
    const { n, category: { value } } = actual[i];
    expect(n).toBe(n0);
    expect(value).toBe(value0);
  });
}

test('CountDAO.byCentrelineNumPerCategory()', async () => {
  // invalid feature
  let numPerCategory = await CountDAO.byCentrelineNumPerCategory(-1, -1, null);
  expectNumPerCategory(numPerCategory, []);

  // invalid date range (start > end)
  let start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let end = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    30000549, CentrelineType.INTERSECTION,
    { start, end },
  );
  expectNumPerCategory(numPerCategory, []);

  // centreline feature with no counts
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    30062737, CentrelineType.SEGMENT,
    null,
    10,
  );
  expectNumPerCategory(numPerCategory, []);

  // centreline feature with some counts
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    14659630, CentrelineType.SEGMENT,
    null,
    10,
  );
  expectNumPerCategory(numPerCategory, [[10, 'ATR_VOLUME'], [6, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, date range filters to empty
  start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    14659630, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expectNumPerCategory(numPerCategory, []);

  // centreline feature with lots of counts
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    1145768, CentrelineType.SEGMENT,
    null,
    10,
  );
  expectNumPerCategory(numPerCategory, [[3633, 'RESCU']]);

  // centreline feature with lots of counts, date range filters to empty
  start = DateTime.fromObject({ year: 1980, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 1980, month: 1, day: 2 });
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    1145768, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expectNumPerCategory(numPerCategory, []);

  // centreline feature with lots of counts, date range filters down
  start = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2016, month: 1, day: 1 });
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    1145768, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expectNumPerCategory(numPerCategory, [[187, 'RESCU']]);

  // centreline feature with more than one kind of count
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    9278884, CentrelineType.SEGMENT,
    null,
    10,
  );
  expectNumPerCategory(numPerCategory, [[6, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);
});

test('CountDAO.byIdAndCategory()', async () => {
  // invalid ID
  let count = await CountDAO.byIdAndCategory(-1, 1);
  expect(count).toBeNull();

  // invalid count type
  count = await CountDAO.byIdAndCategory(1206019, -1);
  expect(count).toBeNull();

  // TMC
  count = await CountDAO.byIdAndCategory(26177, 5);
  expect(count).not.toBeNull();
  expect(count.id).toBe(26177);
  expect(count.type.id).toBe(5);

  // non-TMC
  count = await CountDAO.byIdAndCategory(1415698, 4);
  expect(count).not.toBeNull();
  expect(count.id).toBe(1415698);
  expect(count.type.id).toBe(4);
});

test('CountDataDAO', async () => {
  let count;
  let countData;

  // TMC
  count = await CountDAO.byIdAndCategory(26177, 5);
  countData = await CountDataDAO.byCount(count);
  expect(countData).toEqual(countData_5_26177);

  // non-TMC
  count = await CountDAO.byIdAndCategory(1415698, 4);
  countData = await CountDataDAO.byCount(count);
  expect(countData).toEqual(countData_4_1415698);
});

test('StudyRequestDAO', async () => {
  const user = DAOTestUtils.randomUser();
  const userCreated = await UserDAO.create(user);
  const now = DateTime.local();
  const transientStudyRequest = {
    userSubject: userCreated.subject,
    status: 'REQUESTED',
    closed: false,
    serviceRequestId: null,
    priority: 'STANDARD',
    assignedTo: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reasons: ['TSC', 'PED_SAFETY'],
    ccEmails: [],
    centrelineId: 1729,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
    studies: [{
      studyType: 'TMC',
      daysOfWeek: [2, 3, 4],
      duration: null,
      hours: 'ROUTINE',
      notes: 'completely normal routine turning movement count',
    }],
  };

  // save study request
  let persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest);
  expect(persistedStudyRequest.id).not.toBeNull();

  // fetch saved study request
  let fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // fetch by user
  let byUser = await StudyRequestDAO.byUser(user);
  expect(byUser).toEqual([persistedStudyRequest]);

  // fetch all
  let all = await StudyRequestDAO.all();
  expect(all).toEqual([persistedStudyRequest]);

  // update study request fields
  persistedStudyRequest.reasons = ['TSC'];
  persistedStudyRequest.serviceRequestId = '12345';

  // update existing study fields
  persistedStudyRequest.studies[0].daysOfWeek = [3, 4];
  persistedStudyRequest.studies[0].hours = 'SCHOOL';
  persistedStudyRequest.studies[0].notes = 'oops, this is actually a school count';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // close
  persistedStudyRequest.closed = true;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // reopen
  persistedStudyRequest.closed = false;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // add new study to study request
  persistedStudyRequest.studies.push({
    studyType: 'TMC',
    daysOfWeek: [0, 6],
    duration: null,
    hours: 'OTHER',
    notes: 'complete during shopping mall peak hours',
  });
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // remove study from study request
  persistedStudyRequest.studies.pop();
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // delete study request
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(true);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toBeNull();
  const studies = await StudyDAO.byStudyRequests([persistedStudyRequest]);
  expect(studies).toHaveLength(0);

  // delete: should not work again
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(false);

  // fetch by user
  byUser = await StudyRequestDAO.byUser(user);
  expect(byUser).toEqual([]);

  // fetch all
  all = await StudyRequestDAO.all();
  expect(all).toEqual([]);
});

test('StudyRequestCommentDAO', async () => {
  const user1 = DAOTestUtils.randomUser();
  const userCreated1 = await UserDAO.create(user1);
  const now = DateTime.local();
  const transientStudyRequest = {
    userSubject: userCreated1.subject,
    status: 'REQUESTED',
    closed: false,
    serviceRequestId: 12345,
    priority: 'STANDARD',
    assignedTo: 'FIELD STAFF',
    dueDate: now.plus({ months: 4 }),
    estimatedDeliveryDate: now.plus({ months: 3, weeks: 3 }),
    reasons: ['TSC', 'PED_SAFETY'],
    ccEmails: [],
    centrelineId: 42,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
    studies: [{
      studyType: 'TMC',
      daysOfWeek: [2, 3, 4],
      duration: null,
      hours: 'ROUTINE',
      notes: 'completely normal routine turning movement count',
    }],
  };
  const persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest);

  const transientComment1 = {
    userSubject: userCreated1.subject,
    comment: 'We don\'t normally do this study here.',
  };

  const user2 = DAOTestUtils.randomUser();
  const userCreated2 = await UserDAO.create(user2);
  const transientComment2 = {
    userSubject: userCreated2.subject,
    comment: 'I believe we have already done this study before.',
  };

  // save comment 1
  let persistedComment1 = await StudyRequestCommentDAO.create(
    persistedStudyRequest,
    transientComment1,
  );
  expect(persistedComment1.id).not.toBeNull();

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
    persistedStudyRequest,
    transientComment2,
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

test('StudyRequestReasonDAO', async () => {
  expect(StudyRequestReasonDAO.isInited()).toBe(false);

  let reason = await StudyRequestReasonDAO.byValue('TSC');
  expect(StudyRequestReasonDAO.isInited()).toBe(true);
  expect(reason.value).toBe('TSC');
  expect(reason.label).toBe('Traffic Signal Control');
  expect(StudyRequestReasonDAO.isInited()).toBe(true);

  reason = await StudyRequestReasonDAO.byValue('FOOBAR');
  expect(reason).toBeUndefined();

  StudyRequestReasonDAO.uninit();
  expect(StudyRequestReasonDAO.isInited()).toBe(false);
  await expect(StudyRequestReasonDAO.all()).resolves.toBeInstanceOf(Map);
  expect(StudyRequestReasonDAO.isInited()).toBe(true);
});

test('StudyRequestStatusDAO', async () => {
  expect(StudyRequestStatusDAO.isInited()).toBe(false);

  let status = await StudyRequestStatusDAO.byValue('REQUESTED');
  expect(StudyRequestStatusDAO.isInited()).toBe(true);
  expect(status.value).toBe('REQUESTED');
  expect(status.label).toBe('Requested');
  expect(StudyRequestStatusDAO.isInited()).toBe(true);

  status = await StudyRequestStatusDAO.byValue('FOOBAR');
  expect(status).toBeUndefined();

  StudyRequestStatusDAO.uninit();
  expect(StudyRequestStatusDAO.isInited()).toBe(false);
  await expect(StudyRequestStatusDAO.all()).resolves.toBeInstanceOf(Map);
  expect(StudyRequestStatusDAO.isInited()).toBe(true);
});

test('UserDAO', async () => {
  const user = DAOTestUtils.randomUser();
  await expect(UserDAO.bySubject(user.subject)).resolves.toBeNull();
  await expect(UserDAO.delete(user)).resolves.toEqual(false);
  await expect(UserDAO.update(user)).resolves.toEqual(false);
  const userCreated = await UserDAO.create(user);
  expect(userCreated.subject).toEqual(user.subject);
  await expect(UserDAO.bySubject(user.subject)).resolves.toEqual(user);
  const name = DAOTestUtils.randomUserName();
  const email = DAOTestUtils.randomUserEmail(name);
  const token = uuid();
  Object.assign(user, { name: name.full, email, token });
  await expect(UserDAO.update(user)).resolves.toEqual(true);
  await expect(UserDAO.bySubject(user.subject)).resolves.toEqual(user);
  await expect(UserDAO.delete(user)).resolves.toEqual(true);
  await expect(UserDAO.bySubject(user.subject)).resolves.toBeNull();
});
