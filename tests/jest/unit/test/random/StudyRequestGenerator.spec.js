import StudyRequest from '@/lib/model/StudyRequest';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';

test('StudyRequestGenerator.generateStudyRequest [fuzz test]', async () => {
  for (let i = 0; i < 100; i++) {
    const studyRequest = generateStudyRequest();
    /* eslint-disable-next-line no-await-in-loop */
    await expect(StudyRequest.create.validateAsync(studyRequest)).resolves.toEqual(studyRequest);
  }
});
