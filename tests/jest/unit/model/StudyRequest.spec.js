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
    serviceRequestId: null,
    urgent: false,
    urgentReason: null,
    assignedTo: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reasons: [StudyRequestReason.TSC, StudyRequestReason.PED_SAFETY],
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

  // days of week should be greater than 0!
  transientStudyRequest.daysOfWeek = [-1];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();

  // days of week should be less than 7!
  transientStudyRequest.daysOfWeek = [7];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();

  // urgent requests should have a reason!
  transientStudyRequest.daysOfWeek = [2, 3, 4];
  transientStudyRequest.urgent = true;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();

  // urgent requests should have CC emails!
  transientStudyRequest.urgentReason = 'because i said so';
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();

  // emails should be @toronto.ca!
  transientStudyRequest.ccEmails = ['not.city.staff@gmail.com'];
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();

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

  transientStudyRequest.duration = 24;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.value).toEqual(transientStudyRequest);
  expect(result.error).toBeUndefined();

  // duration should be multiple of 24!
  transientStudyRequest.duration = 25;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();

  // duration should fit in selected days!
  transientStudyRequest.duration = 96;
  result = StudyRequest.create.validate(transientStudyRequest);
  expect(result.error).not.toBeUndefined();
});
