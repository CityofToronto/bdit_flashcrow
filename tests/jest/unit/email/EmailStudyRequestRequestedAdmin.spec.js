import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import EmailStudyRequestRequestedAdmin from '@/lib/email/EmailStudyRequestRequestedAdmin';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/db/UserDAO');

test('EmailStudyRequestRequestedAdmin', async () => {
  const requester = generateUser();
  const studyRequest = generateStudyRequest();
  studyRequest.id = 42;
  const email = new EmailStudyRequestRequestedAdmin(studyRequest);

  const { centrelineId, centrelineType } = studyRequest;
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineId,
    centrelineType,
    description: 'Test location',
  });
  UserDAO.byId.mockResolvedValue(requester);

  await email.init();

  const recipients = email.getRecipients();
  expect(recipients).toEqual([EmailBase.getRecipientStudyRequestAdmin()]);

  const subject = email.getSubject();
  expect(subject).toEqual('[MOVE] New request for Test location');

  const params = email.getBodyParams();
  expect(params.hrefStudyRequest).toEqual('https://localhost:8080/requests/study/42');
  expect(params.location).toEqual('Test location');

  expect(() => {
    email.render();
  }).not.toThrow();
});
