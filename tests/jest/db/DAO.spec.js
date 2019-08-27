import uuid from 'uuid/v4';

import CategoryDAO from '@/../lib/db/CategoryDAO';
import CentrelineDAO from '@/../lib/db/CentrelineDAO';
import StudyRequestReasonDAO from '@/../lib/db/StudyRequestReasonDAO';
import StudyRequestStatusDAO from '@/../lib/db/StudyRequestStatusDAO';
import UserDAO from '@/../lib/db/UserDAO';
import DAOTestUtils from '@/../lib/db/test/DAOTestUtils';
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
