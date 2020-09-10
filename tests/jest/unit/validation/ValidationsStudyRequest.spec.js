import { StudyHours } from '@/lib/Constants';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

test('ValidationsStudyRequest.torontoInternal()', () => {
  const { torontoInternal } = ValidationsStudyRequest.ccEmails.$each;

  expect(torontoInternal('')).toBeFalsy();
  expect(torontoInternal(',,,,,,')).toBeFalsy();
  expect(torontoInternal('foo.bar@gmail.com')).toBeFalsy();
  expect(torontoInternal('Evan.Savage@toronto.ca')).toBeTruthy();
  expect(torontoInternal('toronto.ca')).toBeFalsy();
  expect(torontoInternal('@toronto.ca')).toBeFalsy();
});

test('ValidationsStudyRequest.needsValidDaysOfWeek()', () => {
  const { needsValidDaysOfWeek } = ValidationsStudyRequest.duration;

  expect(needsValidDaysOfWeek(24, { daysOfWeek: [] })).toBeFalsy();
  expect(needsValidDaysOfWeek(24, { daysOfWeek: [2, 3, 4] })).toBeTruthy();
  expect(needsValidDaysOfWeek(48, { daysOfWeek: [2, 3, 4] })).toBeTruthy();
  expect(needsValidDaysOfWeek(72, { daysOfWeek: [2, 3, 4] })).toBeTruthy();
  expect(needsValidDaysOfWeek(96, { daysOfWeek: [2, 3, 4] })).toBeFalsy();
  let i;
  for (i = 0; i < 7; i += 1) {
    expect(needsValidDaysOfWeek(24, { daysOfWeek: [i] })).toBeTruthy();
    expect(needsValidDaysOfWeek(48, { daysOfWeek: [i] })).toBeFalsy();
    expect(needsValidDaysOfWeek(24, { daysOfWeek: [i, (i + 3) % 7] })).toBeTruthy();
    expect(needsValidDaysOfWeek(48, { daysOfWeek: [i, (i + 3) % 7] })).toBeFalsy();
    expect(needsValidDaysOfWeek(24, { daysOfWeek: [i, (i + 1) % 7] })).toBeTruthy();
    expect(needsValidDaysOfWeek(48, { daysOfWeek: [i, (i + 1) % 7] })).toBeTruthy();
    expect(needsValidDaysOfWeek(72, { daysOfWeek: [i, (i + 1) % 7] })).toBeFalsy();
  }
});

test('ValidationsStudyRequest.requiredIfOtherHours()', () => {
  const { requiredIfOtherHours } = ValidationsStudyRequest.notes;

  expect(requiredIfOtherHours(null, { hours: StudyHours.ROUTINE })).toBeTruthy();
  expect(requiredIfOtherHours('', { hours: StudyHours.SCHOOL })).toBeTruthy();
  expect(requiredIfOtherHours('shopping mall hours', { hours: StudyHours.ROUTINE })).toBeTruthy();

  expect(requiredIfOtherHours(null, { hours: StudyHours.OTHER })).toBeFalsy();
  expect(requiredIfOtherHours('', { hours: StudyHours.OTHER })).toBeFalsy();
  expect(requiredIfOtherHours('shopping mall hours', { hours: StudyHours.OTHER })).toBeTruthy();
});
