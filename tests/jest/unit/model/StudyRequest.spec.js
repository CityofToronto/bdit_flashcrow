import {
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import StudyRequest from '@/lib/model/StudyRequest';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';

test('StudyRequest', () => {
  const transientStudyRequest = generateStudyRequest();

  let result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  // days of week should be non-empty!
  transientStudyRequest.daysOfWeek = [];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['daysOfWeek']);
  expect(result.error.details[0].type).toEqual('array.includesRequiredUnknowns');

  // days of week should be greater than 0!
  transientStudyRequest.daysOfWeek = [-1];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['daysOfWeek', 0]);
  expect(result.error.details[0].type).toEqual('number.min');

  // days of week should be less than 7!
  transientStudyRequest.daysOfWeek = [7];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['daysOfWeek', 0]);
  expect(result.error.details[0].type).toEqual('number.max');

  // urgent requests should have an urgent reason!
  transientStudyRequest.daysOfWeek = [2, 3, 4];
  transientStudyRequest.urgent = true;
  transientStudyRequest.urgentReason = null;
  transientStudyRequest.ccEmails = [];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['urgentReason']);
  expect(result.error.details[0].type).toEqual('string.base');

  // urgent requests should have CC emails!
  transientStudyRequest.urgentReason = 'because i said so';
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['ccEmails']);
  expect(result.error.details[0].type).toEqual('array.min');

  // CC emails should be valid email addresses!
  transientStudyRequest.ccEmails = ['3rwufio1uy0fh'];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['ccEmails', 0]);
  expect(result.error.details[0].type).toEqual('string.email');

  // CC emails should be @toronto.ca!
  transientStudyRequest.ccEmails = ['not.city.staff@gmail.com'];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['ccEmails', 0]);
  expect(result.error.details[0].type).toEqual('string.pattern.base');

  transientStudyRequest.ccEmails = ['Evan.Savage@toronto.ca'];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  transientStudyRequest.studyType = StudyType.TMC;
  transientStudyRequest.studyTypeOther = null;
  transientStudyRequest.duration = null;
  transientStudyRequest.hours = StudyHours.OTHER;
  transientStudyRequest.notes = 'do this at the eleventh hour';
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  // notes should be non-empty for requests with OTHER hours!
  transientStudyRequest.notes = '';
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['notes']);
  expect(result.error.details[0].type).toEqual('string.empty');

  transientStudyRequest.hours = StudyHours.SCHOOL;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  // hours should be null for automatic counts!
  transientStudyRequest.studyType = StudyType.ATR_SPEED_VOLUME;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();

  // duration should be non-null for automatic counts!
  transientStudyRequest.hours = null;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['duration']);
  expect(result.error.details[0].type).toEqual('number.base');

  transientStudyRequest.duration = 24;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  // duration should be multiple of 24!
  transientStudyRequest.duration = 25;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['duration']);
  expect(result.error.details[0].type).toEqual('number.multiple');

  // duration should fit in selected days!
  transientStudyRequest.duration = 96;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['duration']);
  expect(result.error.details[0].type).toEqual('any.custom');

  // non-other reasons should not have long-form reason text!
  transientStudyRequest.duration = 72;
  transientStudyRequest.reason = StudyRequestReason.PED_SAFETY;
  transientStudyRequest.reasonOther = 'i should not have entered this';
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['reasonOther']);
  expect(result.error.details[0].type).toEqual('any.only');

  // other reasons should have long-form reason text!
  transientStudyRequest.reason = StudyRequestReason.OTHER;
  transientStudyRequest.reasonOther = null;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['reasonOther']);
  expect(result.error.details[0].type).toEqual('string.base');

  transientStudyRequest.reasonOther = 'i should not have entered this';
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  // other study types should have long-form study type text!
  transientStudyRequest.studyType = StudyType.OTHER_AUTOMATIC;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['studyTypeOther']);
  expect(result.error.details[0].type).toEqual('string.base');

  transientStudyRequest.studyTypeOther = 'just your regular, ordinary study type';
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();
});
