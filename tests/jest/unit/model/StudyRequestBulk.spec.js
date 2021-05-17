import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import { generateStudyRequestBulk } from '@/lib/test/random/StudyRequestGenerator';

test('StudyRequestBulk', () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();

  let result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.value).toEqual(transientStudyRequestBulk);
  expect(result.error).toBeUndefined();

  // CC emails should be valid email addresses!
  transientStudyRequestBulk.ccEmails = ['3rwufio1uy0fh'];
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['ccEmails', 0]);
  expect(result.error.details[0].type).toEqual('string.email');

  // CC emails should be @toronto.ca!
  transientStudyRequestBulk.ccEmails = ['not.city.staff@gmail.com'];
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['ccEmails', 0]);
  expect(result.error.details[0].type).toEqual('string.pattern.base');
});
