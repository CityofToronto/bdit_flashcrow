import { StudyRequestReason } from '@/lib/Constants';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import { generateStudyRequestBulk } from '@/lib/test/random/StudyRequestGenerator';

test('StudyRequest', () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();

  let result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.value).toEqual(transientStudyRequestBulk);
  expect(result.error).toBeUndefined();

  // urgent requests should have CC emails!
  transientStudyRequestBulk.urgent = true;
  transientStudyRequestBulk.urgentReason = 'because i said so';
  transientStudyRequestBulk.ccEmails = [];
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['ccEmails']);
  expect(result.error.details[0].type).toEqual('array.min');

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

  // urgent requests should have an urgent reason!
  transientStudyRequestBulk.urgentReason = null;
  transientStudyRequestBulk.ccEmails = ['Evan.Savage@toronto.ca'];
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.value).toEqual(transientStudyRequestBulk);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['urgentReason']);
  expect(result.error.details[0].type).toEqual('string.base');

  transientStudyRequestBulk.urgentReason = 'because i said so';
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.error).toBeUndefined();

  // non-other reasons should not have long-form reason text!
  transientStudyRequestBulk.reason = StudyRequestReason.PED_SAFETY;
  transientStudyRequestBulk.reasonOther = 'i should not have entered this';
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['reasonOther']);
  expect(result.error.details[0].type).toEqual('any.only');

  // other reasons should have long-form reason text!
  transientStudyRequestBulk.reason = StudyRequestReason.OTHER;
  transientStudyRequestBulk.reasonOther = null;
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['reasonOther']);
  expect(result.error.details[0].type).toEqual('string.base');

  transientStudyRequestBulk.reasonOther = 'i should not have entered this';
  result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.value).toEqual(transientStudyRequestBulk);
  expect(result.error).toBeUndefined();
});
