import CentrelineDAO from '@/lib/db/CentrelineDAO';
import EmailStudyRequestBulkConfirmation from '@/lib/email/EmailStudyRequestBulkConfirmation';
import CompositeId from '@/lib/io/CompositeId';
import { generateStudyRequestBulk } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

jest.mock('@/lib/db/CentrelineDAO');

test('EmailStudyRequestConfirmation', async () => {
  const user = generateUser();
  const studyRequestBulk = generateStudyRequestBulk();
  studyRequestBulk.id = 17;
  const email = new EmailStudyRequestBulkConfirmation(user, studyRequestBulk);

  const locations = studyRequestBulk.studyRequests.map(({ centrelineId, centrelineType }, i) => ({
    centrelineId,
    centrelineType,
    description: `Test location #${i + 1}`,
  }));
  CentrelineDAO.byFeatures.mockResolvedValue(locations);

  await email.init();

  const recipients = email.getRecipients();
  expect(recipients).toEqual([user.email, ...studyRequestBulk.ccEmails]);

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
