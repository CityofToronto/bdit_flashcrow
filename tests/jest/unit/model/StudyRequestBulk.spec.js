import {
  CentrelineType,
  LocationSelectionType,
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import CompositeId from '@/lib/io/CompositeId';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import DateTime from '@/lib/time/DateTime';

test('StudyRequest', () => {
  const now = DateTime.local();

  const transientStudyRequest1 = {
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

  const transientStudyRequest2 = {
    urgent: false,
    urgentReason: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reason: StudyRequestReason.TSC,
    reasonOther: null,
    ccEmails: [],
    studyType: StudyType.ATR_SPEED_VOLUME,
    daysOfWeek: [2, 3, 4],
    duration: 72,
    hours: null,
    notes: 'completely normal routine turning movement count',
    centrelineId: 5555,
    centrelineType: CentrelineType.SEGMENT,
    geom: {
      type: 'Point',
      coordinates: [-79.343251, 43.709012],
    },
  };

  const studyRequests = [transientStudyRequest1, transientStudyRequest2];
  const features = studyRequests.map(
    ({ centrelineId, centrelineType }) => ({ centrelineId, centrelineType }),
  );
  const s1 = CompositeId.encode(features);

  const transientStudyRequestBulk = {
    ccEmails: [],
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    name: 'best bulk request ever',
    reason: StudyRequestReason.TSC,
    reasonOther: null,
    s1,
    selectionType: LocationSelectionType.POINTS,
    studyRequests,
    urgent: false,
    urgentReason: null,
  };

  let result = StudyRequestBulk.create.validate(transientStudyRequestBulk);
  expect(result.value).toEqual(transientStudyRequestBulk);
  expect(result.error).toBeUndefined();

  // urgent requests should have CC emails!
  transientStudyRequestBulk.urgent = true;
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
