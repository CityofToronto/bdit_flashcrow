import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailStudyRequestBulkRequested from '@/lib/email/EmailStudyRequestBulkRequested';
import { generateStudyRequestBulk } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/db/UserDAO');

test('EmailStudyRequestBulkRequested', async () => {
  const requester = generateUser();
  const studyRequestBulk = generateStudyRequestBulk();
  studyRequestBulk.id = 17;
  const email = new EmailStudyRequestBulkRequested(studyRequestBulk);

  const locations = studyRequestBulk.studyRequests.map(({ centrelineId, centrelineType }, i) => ({
    centrelineId,
    centrelineType,
    description: `Test location #${i + 1}`,
  }));
  CentrelineDAO.byFeatures.mockResolvedValue(locations);
  UserDAO.byId.mockResolvedValue(requester);

  await email.init();

  const recipients = email.getRecipients();
  expect(recipients).toEqual([requester.email, ...studyRequestBulk.ccEmails]);

  const subject = email.getSubject();
  expect(subject).toEqual(`[MOVE] Requests received for ${studyRequestBulk.name}`);

  const params = email.getBodyParams();
  expect(params.hrefStudyRequestBulk).toEqual('https://localhost:8080/requests/study/bulk/17');
  expect(params.location).toMatch(/^Test location #1/);
  expect(params.studyRequests).toHaveLength(studyRequestBulk.studyRequests.length);
  params.studyRequests.forEach((studyRequest, i) => {
    expect(studyRequest.location).toEqual(`Test location #${i + 1}`);
  });

  expect(() => {
    email.render();
  }).not.toThrow();
});
