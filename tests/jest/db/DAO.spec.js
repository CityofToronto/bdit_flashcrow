import uuid from 'uuid/v4';

import CategoryDAO from '@/../lib/db/CategoryDAO';
import CentrelineDAO from '@/../lib/db/CentrelineDAO';
import CountDAO from '@/../lib/db/CountDAO';
import StudyRequestReasonDAO from '@/../lib/db/StudyRequestReasonDAO';
import StudyRequestStatusDAO from '@/../lib/db/StudyRequestStatusDAO';
import UserDAO from '@/../lib/db/UserDAO';
import DAOTestUtils from '@/../lib/test/DAOTestUtils';
import {
  centrelineKey,
  CentrelineType,
} from '@/lib/Constants';

beforeAll(DAOTestUtils.startupWithDevData, DAOTestUtils.TIMEOUT);
afterAll(DAOTestUtils.shutdown, DAOTestUtils.TIMEOUT);

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
  result = await CentrelineDAO.byIdAndType(-1, -1);
  expect(result).toBeNull();
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

  // only invalid
  query = [
    { centrelineId: -1, centrelineType: -1 },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, []);

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

  // single value + invalid
  query = [
    { centrelineId: -1, centrelineType: -1 },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, [query[1]]);

  // intersection + segment
  query = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  results = await CentrelineDAO.byIdsAndTypes(query);
  expectIdsAndTypesResults(results, query);
});

test('CountDAO.byBoundingBox()', async () => {
  // bounding box outside of Toronto
  let results = await CountDAO.byBoundingBox(0, 0, 1, 1);
  expect(results).toHaveLength(0);

  // empty bounding box
  results = await CountDAO.byBoundingBox(
    -79.347015, 43.651070,
    -79.347015, 43.651070,
  );
  expect(results).toHaveLength(0);

  // invalid bounding box (xmin > xmax, ymin > ymax)
  results = await CountDAO.byBoundingBox(
    -79.115243191, 43.855457183,
    -79.639264937, 43.580995995,
  );
  expect(results).toHaveLength(0);

  // bounding box containing one item
  results = await CountDAO.byBoundingBox(
    -79.39105486856735, 43.66697119145863,
    -79.3797296679832, 43.67108387524755,
  );
  expect(results).toHaveLength(1);

  // bounding box containing a bunch of items
  results = await CountDAO.byBoundingBox(
    -79.40506206200341, 43.663771812301974,
    -79.37883903724058, 43.673294636735676,
  );
  expect(results.length).toBeGreaterThan(1);
});

test('CountDAO.byCentreline()', async () => {
  // invalid feature
  let counts = await CountDAO.byCentreline(-1, -1, null, 10);
  expect(counts).toHaveLength(0);

  // invalid date range (start > end)
  let start = new Date(2018, 0, 1);
  let end = new Date(2017, 11, 31);
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
  expect(counts).toHaveLength(2);

  // valid feature with less than maxPerCategory counts, date range
  // filters to empty
  start = new Date(2018, 0, 1);
  end = new Date(2019, 0, 1);
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
  start = new Date(2015, 0, 1);
  end = new Date(2016, 0, 1);
  counts = await CountDAO.byCentreline(
    1145768, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expect(counts).toHaveLength(3);
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
  let start = new Date(2018, 0, 1);
  let end = new Date(2017, 11, 31);
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
  expectNumPerCategory(numPerCategory, [[2, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, date range filters to empty
  start = new Date(2018, 0, 1);
  end = new Date(2019, 0, 1);
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
  expectNumPerCategory(numPerCategory, [[14, 'RESCU']]);

  // centreline feature with lots of counts, date range filters to empty
  start = new Date(1980, 0, 1);
  end = new Date(1980, 0, 2);
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    1145768, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expectNumPerCategory(numPerCategory, []);

  // centreline feature with lots of counts, date range filters down
  start = new Date(2015, 0, 1);
  end = new Date(2016, 0, 1);
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    1145768, CentrelineType.SEGMENT,
    { start, end },
    10,
  );
  expectNumPerCategory(numPerCategory, [[3, 'RESCU']]);

  // centreline feature with more than one kind of count
  numPerCategory = await CountDAO.byCentrelineNumPerCategory(
    9278884, CentrelineType.SEGMENT,
    null,
    10,
  );
  expectNumPerCategory(numPerCategory, [[1, 'ATR_VOLUME'], [1, 'ATR_SPEED_VOLUME']]);
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

test('StudyRequestReasonDAO', async () => {
  expect(StudyRequestReasonDAO.isInited()).toBe(false);

  let reason = await StudyRequestReasonDAO.byValue('TSC');
  expect(reason.value).toBe('TSC');
  expect(reason.label).toBe('Traffic Signal Control');
  expect(StudyRequestReasonDAO.isInited()).toBe(true);

  reason = await StudyRequestReasonDAO.byValue('FOOBAR');
  expect(reason).toBeUndefined();

  await expect(StudyRequestReasonDAO.all()).resolves.toBeInstanceOf(Map);
});

test('StudyRequestStatusDAO', async () => {
  expect(StudyRequestStatusDAO.isInited()).toBe(false);

  let status = await StudyRequestStatusDAO.byValue('REQUESTED');
  expect(status.value).toBe('REQUESTED');
  expect(status.label).toBe('Requested');
  expect(StudyRequestStatusDAO.isInited()).toBe(true);

  status = await StudyRequestStatusDAO.byValue('FOOBAR');
  expect(status).toBeUndefined();

  await expect(StudyRequestStatusDAO.all()).resolves.toBeInstanceOf(Map);
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
