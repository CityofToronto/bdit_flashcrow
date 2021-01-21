import CentrelineDAO from '@/lib/db/CentrelineDAO';
import EmailStudyRequestRequested from '@/lib/email/EmailStudyRequestRequested';
import CompositeId from '@/lib/io/CompositeId';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

jest.mock('@/lib/db/CentrelineDAO');

test('EmailStudyRequestRequested', async () => {
  const user = generateUser();
  const studyRequest = generateStudyRequest();
  studyRequest.id = 42;
  const email = new EmailStudyRequestRequested(user, studyRequest);

  const { centrelineId, centrelineType } = studyRequest;
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineId,
    centrelineType,
    description: 'Test location',
  });

  await email.init();

  const recipients = email.getRecipients();
  expect(recipients).toEqual([user.email, ...studyRequest.ccEmails]);

  const subject = email.getSubject();
  expect(subject).toEqual('[MOVE] Request received for Test location');

  const params = email.getBodyParams();
  const s1 = CompositeId.encode([studyRequest]);
  expect(params.hrefLocation).toEqual(`https://localhost:8080/view/location/${s1}/POINTS`);
  expect(params.hrefStudyRequest).toEqual('https://localhost:8080/requests/study/42');
  expect(params.location).toEqual('Test location');

  expect(() => {
    email.render();
  }).not.toThrow();
});
