import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailStudyRequestBulkRequested from '@/lib/email/EmailStudyRequestBulkRequested';
import CompositeId from '@/lib/io/CompositeId';
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
  const s1 = CompositeId.encode(locations);
  expect(params.hrefLocation).toEqual(`https://localhost:8080/view/location/${s1}/POINTS`);
  expect(params.hrefStudyRequestBulk).toEqual('https://localhost:8080/requests/study/bulk/17');
  expect(params.location).toMatch(/^Test location #1/);
  expect(params.studyRequests).toHaveLength(studyRequestBulk.studyRequests.length);

  expect(() => {
    email.render();
  }).not.toThrow();
});
