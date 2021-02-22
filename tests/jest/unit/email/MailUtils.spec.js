import { StudyRequestStatus } from '@/lib/Constants';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import EmailStudyRequestBulkCancelled from '@/lib/email/EmailStudyRequestBulkCancelled';
import EmailStudyRequestBulkCompleted from '@/lib/email/EmailStudyRequestBulkCompleted';
import EmailStudyRequestCancelled from '@/lib/email/EmailStudyRequestCancelled';
import EmailStudyRequestCompleted from '@/lib/email/EmailStudyRequestCompleted';
import {
  getStudyRequestBulkUpdateEmails,
  getStudyRequestUpdateEmails,
  getStudyRequestUpdateEmailsDeep,
} from '@/lib/email/MailUtils';
import {
  generateStudyRequest,
  generateStudyRequestBulk,
} from '@/lib/test/random/StudyRequestGenerator';

jest.mock('@/lib/db/StudyRequestBulkDAO');

function studyRequestBulkWithStatus(studyRequestBulk, status) {
  return {
    ...studyRequestBulk,
    studyRequests: studyRequestBulk.studyRequests.map(studyRequest => ({
      ...studyRequest,
      status,
    })),
  };
}

test('MailUtils.getStudyRequestBulkUpdateEmails', () => {
  const studyRequestBulk = generateStudyRequestBulk();
  studyRequestBulk.id = 42;

  let studyRequestBulkNew = studyRequestBulkWithStatus(
    studyRequestBulk,
    StudyRequestStatus.CHANGES_NEEDED,
  );
  let studyRequestBulkOld = studyRequestBulk;
  let emails = getStudyRequestBulkUpdateEmails(studyRequestBulkNew, studyRequestBulkOld);
  expect(emails).toHaveLength(0);

  studyRequestBulkOld = studyRequestBulkNew;
  studyRequestBulkNew = studyRequestBulkWithStatus(
    studyRequestBulk,
    StudyRequestStatus.CANCELLED,
  );
  emails = getStudyRequestBulkUpdateEmails(studyRequestBulkNew, studyRequestBulkOld);
  expect(emails).toHaveLength(1);
  expect(emails[0]).toBeInstanceOf(EmailStudyRequestBulkCancelled);

  studyRequestBulkOld = studyRequestBulkWithStatus(
    studyRequestBulk,
    StudyRequestStatus.ASSIGNED,
  );
  studyRequestBulkNew = studyRequestBulkWithStatus(
    studyRequestBulk,
    StudyRequestStatus.COMPLETED,
  );
  emails = getStudyRequestBulkUpdateEmails(studyRequestBulkNew, studyRequestBulkOld);
  expect(emails).toHaveLength(1);
  expect(emails[0]).toBeInstanceOf(EmailStudyRequestBulkCompleted);
});

test('MailUtils.getStudyRequestUpdateEmails', () => {
  const studyRequest = generateStudyRequest();
  studyRequest.id = 42;

  let studyRequestNew = {
    ...studyRequest,
    status: StudyRequestStatus.CHANGES_NEEDED,
  };
  let studyRequestOld = studyRequest;
  let emails = getStudyRequestUpdateEmails(studyRequestNew, studyRequestOld);
  expect(emails).toHaveLength(0);

  studyRequestOld = studyRequestNew;
  studyRequestNew = {
    ...studyRequest,
    status: StudyRequestStatus.CANCELLED,
  };
  emails = getStudyRequestUpdateEmails(studyRequestNew, studyRequestOld);
  expect(emails).toHaveLength(1);
  expect(emails[0]).toBeInstanceOf(EmailStudyRequestCancelled);

  studyRequestOld = {
    ...studyRequest,
    status: StudyRequestStatus.ASSIGNED,
  };
  studyRequestNew = {
    ...studyRequest,
    status: StudyRequestStatus.COMPLETED,
  };
  emails = getStudyRequestUpdateEmails(studyRequestNew, studyRequestOld);
  expect(emails).toHaveLength(1);
  expect(emails[0]).toBeInstanceOf(EmailStudyRequestCompleted);
});

test('MailUtils.getStudyRequestUpdateEmailsDeep [cancelling single request]', async () => {
  const studyRequestBulk = generateStudyRequestBulk();
  studyRequestBulk.id = 42;
  studyRequestBulk.studyRequests = studyRequestBulk.studyRequests.map((studyRequest, i) => ({
    ...studyRequest,
    status: StudyRequestStatus.REQUESTED,
    id: i + 1,
    studyRequestBulkId: studyRequestBulk.id,
  }));
  StudyRequestBulkDAO.byId.mockResolvedValue(studyRequestBulk);

  const studyRequestNew = {
    ...studyRequestBulk.studyRequests[0],
    status: StudyRequestStatus.CANCELLED,
  };
  const studyRequestOld = studyRequestBulk.studyRequests[0];
  const emails = await getStudyRequestUpdateEmailsDeep(studyRequestNew, studyRequestOld);
  expect(emails).toHaveLength(1);
  expect(emails[0]).toBeInstanceOf(EmailStudyRequestCancelled);
});

test('MailUtils.getStudyRequestUpdateEmailsDeep [completing single request]', async () => {
  const studyRequestBulk = generateStudyRequestBulk();
  studyRequestBulk.id = 42;
  studyRequestBulk.studyRequests = studyRequestBulk.studyRequests.map((studyRequest, i) => ({
    ...studyRequest,
    status: StudyRequestStatus.REQUESTED,
    id: i + 1,
    studyRequestBulkId: studyRequestBulk.id,
  }));
  StudyRequestBulkDAO.byId.mockResolvedValue(studyRequestBulk);

  const studyRequestNew = {
    ...studyRequestBulk.studyRequests[0],
    status: StudyRequestStatus.COMPLETED,
  };
  const studyRequestOld = studyRequestBulk.studyRequests[0];
  const emails = await getStudyRequestUpdateEmailsDeep(studyRequestNew, studyRequestOld);
  expect(emails).toHaveLength(0);
});

test('MailUtils.getStudyRequestUpdateEmailsDeep [completing last request]', async () => {
  const studyRequestBulk = generateStudyRequestBulk();
  studyRequestBulk.id = 42;
  studyRequestBulk.studyRequests = studyRequestBulk.studyRequests.map((studyRequest, i) => ({
    ...studyRequest,
    status: i === 0 ? StudyRequestStatus.REQUESTED : StudyRequestStatus.COMPLETED,
    id: i + 1,
    studyRequestBulkId: studyRequestBulk.id,
  }));
  StudyRequestBulkDAO.byId.mockResolvedValue(studyRequestBulk);

  const studyRequestNew = {
    ...studyRequestBulk.studyRequests[0],
    status: StudyRequestStatus.COMPLETED,
  };
  const studyRequestOld = studyRequestBulk.studyRequests[0];
  const emails = await getStudyRequestUpdateEmailsDeep(studyRequestNew, studyRequestOld);
  expect(emails).toHaveLength(1);
  expect(emails[0]).toBeInstanceOf(EmailStudyRequestBulkCompleted);
});

test('MailUtils.getStudyRequestUpdateEmailsDeep [cancelling last request]', async () => {
  const studyRequestBulk = generateStudyRequestBulk();
  studyRequestBulk.id = 42;
  studyRequestBulk.studyRequests = studyRequestBulk.studyRequests.map((studyRequest, i) => ({
    ...studyRequest,
    status: i === 0 ? StudyRequestStatus.REQUESTED : StudyRequestStatus.COMPLETED,
    id: i + 1,
    studyRequestBulkId: studyRequestBulk.id,
  }));
  StudyRequestBulkDAO.byId.mockResolvedValue(studyRequestBulk);

  const studyRequestNew = {
    ...studyRequestBulk.studyRequests[0],
    status: StudyRequestStatus.CANCELLED,
  };
  const studyRequestOld = studyRequestBulk.studyRequests[0];
  const emails = await getStudyRequestUpdateEmailsDeep(studyRequestNew, studyRequestOld);
  expect(emails).toHaveLength(2);
  expect(emails[0]).toBeInstanceOf(EmailStudyRequestCancelled);
  expect(emails[1]).toBeInstanceOf(EmailStudyRequestBulkCompleted);
});
