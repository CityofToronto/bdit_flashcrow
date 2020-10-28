import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import {
  generateStudyRequest,
  generateStudyRequestBulk,
} from '@/lib/test/random/StudyRequestGenerator';

test('StudyRequestGenerator.generateStudyRequest [fuzz test]', async () => {
  for (let i = 0; i < 100; i++) {
    const studyRequest = generateStudyRequest();
    /* eslint-disable-next-line no-await-in-loop */
    await expect(StudyRequest.create.validateAsync(studyRequest)).resolves.toEqual(studyRequest);
  }
});

test('StudyRequestGenerator.generateStudyRequestBulk [fuzz test]', async () => {
  for (let i = 0; i < 100; i++) {
    const studyRequestBulk = generateStudyRequestBulk();
    /* eslint-disable-next-line no-await-in-loop */
    await expect(
      StudyRequestBulk.create.validateAsync(studyRequestBulk),
    ).resolves.toEqual(studyRequestBulk);
  }
});
