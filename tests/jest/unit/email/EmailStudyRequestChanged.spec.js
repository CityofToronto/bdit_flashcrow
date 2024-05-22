import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import EmailStudyRequestChangedAdmin from '@/lib/email/EmailStudyRequestChangedAdmin';
import { getRequestChanges } from '@/lib/email/MailUtils';
import { generateStudyRequest, generateStudyTypeChange } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/db/UserDAO');

test('EmailStudyRequestChanged', async () => {
  const requester = generateUser();
  const studyRequestOld = generateStudyRequest();
  studyRequestOld.id = 42;
  const studyRequestNew = generateStudyTypeChange(studyRequestOld);
  const studyRequestChanges = getRequestChanges(studyRequestNew, studyRequestOld);

  const { centrelineId, centrelineType } = studyRequestOld;
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineId,
    centrelineType,
    description: 'Test location',
  });
  UserDAO.byId.mockResolvedValue(requester);

  const {
    centrelineId: centrelineIdOld,
    centrelineType: centrelineTypeOld, id,
  } = studyRequestOld;
  const {
    centrelineId: centrelineIdNew,
    centrelineType: centrelineTypeNew, userId,
  } = studyRequestNew;
  const featureOld = { centrelineId: centrelineIdOld, centrelineType: centrelineTypeOld };
  const featureNew = { centrelineId: centrelineIdNew, centrelineType: centrelineTypeNew };
  const requestChanges = {
    studyRequestChanges, featureOld, featureNew, id, userId,
  };
  const email = new EmailStudyRequestChangedAdmin(requestChanges);

  await email.init();

  const recipients = email.getRecipients();
  expect(recipients).toEqual([EmailBase.getRecipientStudyRequestAdmin()]);

  const subject = email.getSubject();
  expect(subject).toEqual('[MOVE] Request changed: #42 - Test location');

  const params = email.getBodyParams();
  expect(params.hrefStudyRequest).toEqual('https://localhost:8080/requests/study/42');
  expect(params.locationOld).toEqual('Test location');
  expect(params.studyChanges.length).toBeGreaterThanOrEqual(1);

  expect(() => {
    email.render();
  }).not.toThrow();
});
