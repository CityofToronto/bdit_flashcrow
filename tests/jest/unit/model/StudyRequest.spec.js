import {
  CentrelineType,
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import StudyRequest from '@/lib/model/StudyRequest';
import DateTime from '@/lib/time/DateTime';

test('StudyRequest', () => {
  const now = DateTime.local();

  const transientStudyRequest = {
    urgent: false,
    urgentReason: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reason: StudyRequestReason.TSC,
    reasonOther: null,
    ccEmails: [],
    studyType: StudyType.TMC,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: StudyHours.ROUTINE,
    notes: 'completely normal routine turning movement count',
    centrelineId: 1729,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
  };

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

  transientStudyRequest.hours = StudyHours.OTHER;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  // notes should be non-empty for requests with OTHER hours!
  transientStudyRequest.notes = null;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
  expect(result.error.details[0].path).toEqual(['notes']);
  expect(result.error.details[0].type).toEqual('string.base');

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
});
