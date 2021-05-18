import { v4 as uuidv4 } from 'uuid';

import { StudyHours, StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import { generateFiltersStudyRequestForStudyRequestId } from '@/lib/test/random/FilterGenerator';
import {
  generateStudyRequest,
  generateStudyRequestBulk,
} from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

let user;

async function initUser() {
  const transientUser = generateUser();
  user = await UserDAO.create(transientUser);
}

beforeAll(async () => {
  await initUser();
});

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestBulkDAO.byId [invalid ID]', async () => {
  const studyRequestBulk = await StudyRequestBulkDAO.byId(-1);
  expect(studyRequestBulk).toBeNull();
});

test('StudyRequestBulkDAO.byId', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  const persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    user,
  );

  const studyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(studyRequestBulk).toEqual(persistedStudyRequestBulk);
});

test('StudyRequestBulkDAO.nameById [invalid ID]', async () => {
  const name = await StudyRequestBulkDAO.nameById(-1);
  expect(name).toBeNull();
});

test('StudyRequestBulkDAO.nameById', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  const persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    user,
  );

  const name = await StudyRequestBulkDAO.nameById(persistedStudyRequestBulk.id);
  expect(name).toEqual(persistedStudyRequestBulk.name);
});

test('StudyRequestBulkDAO.byIds [empty]', async () => {
  const studyRequestsBulk = await StudyRequestBulkDAO.byIds([]);
  expect(studyRequestsBulk).toEqual([]);
});

test('StudyRequestBulkDAO.byIds [invalid IDs]', async () => {
  const studyRequestsBulk = await StudyRequestBulkDAO.byIds([-1]);
  expect(studyRequestsBulk).toEqual([]);
});

test('StudyRequestBulkDAO.byIds', async () => {
  const transientStudyRequestBulk1 = generateStudyRequestBulk();
  const persistedStudyRequestBulk1 = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk1,
    user,
  );

  let studyRequestsBulk = await StudyRequestBulkDAO.byIds([persistedStudyRequestBulk1.id]);
  expect(studyRequestsBulk).toEqual([persistedStudyRequestBulk1]);

  const transientStudyRequestBulk2 = generateStudyRequestBulk();
  const persistedStudyRequestBulk2 = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk2,
    user,
  );

  studyRequestsBulk = await StudyRequestBulkDAO.byIds([
    persistedStudyRequestBulk1.id,
    persistedStudyRequestBulk2.id,
  ]);
  expect(studyRequestsBulk).toEqual([persistedStudyRequestBulk1, persistedStudyRequestBulk2]);

  studyRequestsBulk = await StudyRequestBulkDAO.byIds([
    persistedStudyRequestBulk2.id,
    persistedStudyRequestBulk1.id,
  ]);
  expect(studyRequestsBulk).toEqual([persistedStudyRequestBulk1, persistedStudyRequestBulk2]);
});

test('StudyRequestBulkDAO.nameSuggestions', async () => {
  const TP = generateStudyRequestBulk();
  TP.name = uuidv4();
  const P = await StudyRequestBulkDAO.create(TP, user);

  let studyRequestsBulk = await StudyRequestBulkDAO.nameSuggestions(uuidv4(), 10);
  expect(studyRequestsBulk).toEqual([]);

  studyRequestsBulk = await StudyRequestBulkDAO.nameSuggestions(P.name, 10);
  expect(studyRequestsBulk).toContainEqual(P);

  const query = P.name.slice(9, 23).toUpperCase();
  studyRequestsBulk = await StudyRequestBulkDAO.nameSuggestions(query, 10);
  expect(studyRequestsBulk).toContainEqual(P);
});

test('StudyRequestBulkDAO.create', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();

  // save bulk study request
  const persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    user,
  );
  expect(persistedStudyRequestBulk.id).not.toBeNull();
  expect(persistedStudyRequestBulk.userId).toBe(user.id);
  persistedStudyRequestBulk.studyRequests.forEach((studyRequest) => {
    expect(studyRequest.userId).toBe(user.id);
    expect(studyRequest.studyRequestBulkId).toBe(persistedStudyRequestBulk.id);
  });
  await expect(
    StudyRequestBulk.read.validateAsync(persistedStudyRequestBulk),
  ).resolves.toEqual(persistedStudyRequestBulk);

  const [studyRequest] = persistedStudyRequestBulk.studyRequests;
  const items = await StudyRequestItemDAO.byQuery(
    generateFiltersStudyRequestForStudyRequestId(studyRequest.id),
  );
  expect(items).not.toContainEqual({ bulk: false, id: studyRequest.id });
  expect(items).toContainEqual({ bulk: true, id: persistedStudyRequestBulk.id });
});

test('StudyRequestBulkDAO', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  let persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    user,
  );

  // update existing bulk request fields
  persistedStudyRequestBulk.name = 'new and improved bulk study request';
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  let fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // get rid of ccEmails
  persistedStudyRequestBulk.ccEmails = [];
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // add ccEmails
  persistedStudyRequestBulk.ccEmails = ['Evan.Savage@toronto.ca'];
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // update sub-request fields
  persistedStudyRequestBulk.studyRequests[0].studyType = StudyType.TMC;
  persistedStudyRequestBulk.studyRequests[0].studyTypeOther = null;
  persistedStudyRequestBulk.studyRequests[0].duration = null;
  persistedStudyRequestBulk.studyRequests[0].hours = StudyHours.SCHOOL;

  persistedStudyRequestBulk.studyRequests[1].studyType = StudyType.ATR_VOLUME_BICYCLE;
  persistedStudyRequestBulk.studyRequests[1].studyTypeOther = null;
  persistedStudyRequestBulk.studyRequests[1].duration = 48;
  persistedStudyRequestBulk.studyRequests[1].hours = null;

  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);
});

test('StudyRequestBulkDAO.setStudyRequestBulk [empty]', async () => {
  const P = await StudyRequestBulkDAO.create(generateStudyRequestBulk(), user);
  await expect(StudyRequestBulkDAO.setStudyRequestBulk([], P)).resolves.toEqual(P);
});

test('StudyRequestBulkDAO.setStudyRequestBulk', async () => {
  const R1 = await StudyRequestDAO.create(generateStudyRequest(), user);
  const R2 = await StudyRequestDAO.create(generateStudyRequest(), user);
  const R3 = await StudyRequestDAO.create(generateStudyRequest(), user);

  const TP1 = generateStudyRequestBulk();
  TP1.studyRequests = [
    generateStudyRequest(),
    generateStudyRequest(),
  ];
  let P1 = await StudyRequestBulkDAO.create(TP1, user);
  const [R4, R5] = P1.studyRequests;
  const TP2 = generateStudyRequestBulk();
  TP2.studyRequests = [];
  let P2 = await StudyRequestBulkDAO.create(TP2, user);

  // add R1, R3 to P2
  P2 = await StudyRequestBulkDAO.setStudyRequestBulk([R1, R3], P2);
  R1.studyRequestBulkId = P2.id;
  R3.studyRequestBulkId = P2.id;
  expect(P2.studyRequests).toEqual([R1, R3]);
  let items = await StudyRequestItemDAO.byQuery(
    generateFiltersStudyRequestForStudyRequestId(R1.id),
  );
  expect(items).not.toContainEqual({ bulk: false, id: R1.id });
  expect(items).toContainEqual({ bulk: true, id: P2.id });

  // add R2, R5 to P1
  P1 = await StudyRequestBulkDAO.setStudyRequestBulk([R2, R5], P1);
  P2 = await StudyRequestBulkDAO.byId(P2.id);
  R2.studyRequestBulkId = P1.id;
  R5.studyRequestBulkId = P1.id;
  expect(P1.studyRequests).toEqual([R2, R4, R5]);
  expect(P2.studyRequests).toEqual([R1, R3]);
  items = await StudyRequestItemDAO.byQuery(
    generateFiltersStudyRequestForStudyRequestId(R2.id),
  );
  expect(items).not.toContainEqual({ bulk: false, id: R2.id });
  expect(items).toContainEqual({ bulk: true, id: P1.id });
  items = await StudyRequestItemDAO.byQuery(
    generateFiltersStudyRequestForStudyRequestId(R5.id),
  );
  expect(items).not.toContainEqual({ bulk: false, id: R5.id });
  expect(items).toContainEqual({ bulk: true, id: P1.id });

  // move R1, R4 to P2
  P2 = await StudyRequestBulkDAO.setStudyRequestBulk([R1, R4], P2);
  P1 = await StudyRequestBulkDAO.byId(P1.id);
  R1.studyRequestBulkId = P2.id;
  R4.studyRequestBulkId = P2.id;
  expect(P1.studyRequests).toEqual([R2, R5]);
  expect(P2.studyRequests).toEqual([R1, R3, R4]);
  items = await StudyRequestItemDAO.byQuery(
    generateFiltersStudyRequestForStudyRequestId(R1.id),
  );
  expect(items).not.toContainEqual({ bulk: false, id: R1.id });
  expect(items).toContainEqual({ bulk: true, id: P2.id });

  // remove R4 from P2
  await StudyRequestBulkDAO.setStudyRequestBulk([R4], null);
  P1 = await StudyRequestBulkDAO.byId(P1.id);
  P2 = await StudyRequestBulkDAO.byId(P2.id);
  R4.studyRequestBulkId = null;
  expect(P1.studyRequests).toEqual([R2, R5]);
  expect(P2.studyRequests).toEqual([R1, R3]);
  items = await StudyRequestItemDAO.byQuery(
    generateFiltersStudyRequestForStudyRequestId(R4.id),
  );
  expect(items).toContainEqual({ bulk: false, id: R4.id });
  expect(items).not.toContainEqual({ bulk: true, id: P2.id });
});

test('StudyRequestBulkDAO.delete', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  const persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    user,
  );

  // delete bulk study request
  await expect(StudyRequestBulkDAO.delete(persistedStudyRequestBulk)).resolves.toBe(true);
  const fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toBeNull();

  // fetch using byIds
  const fetchedStudyRequestsBulk = await StudyRequestBulkDAO.byIds([persistedStudyRequestBulk.id]);
  expect(fetchedStudyRequestsBulk).toEqual([]);

  // fetch study requests by bulk request
  const byStudyRequestBulk = await StudyRequestDAO.byStudyRequestBulk(persistedStudyRequestBulk);
  expect(byStudyRequestBulk).toEqual([]);

  // fetch study requests by bulk requests
  const byStudyRequestsBulk = await StudyRequestDAO.byStudyRequestsBulk([
    persistedStudyRequestBulk,
  ]);
  expect(byStudyRequestsBulk).toEqual([]);

  // fetch indexed items
  const [studyRequest] = persistedStudyRequestBulk.studyRequests;
  const items = await StudyRequestItemDAO.byQuery(
    generateFiltersStudyRequestForStudyRequestId(studyRequest.id),
  );
  expect(items).toEqual([]);

  // delete: should not work again
  await expect(StudyRequestBulkDAO.delete(persistedStudyRequestBulk)).resolves.toBe(false);
});
