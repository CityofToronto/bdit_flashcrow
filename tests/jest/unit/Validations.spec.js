import { StudyHours } from '@/lib/Constants';
import ValidationsStudyRequest, {
  numConsecutiveDaysOfWeek,
} from '@/lib/validation/ValidationsStudyRequest';

test('numConsecutiveDaysOfWeek()', () => {
  // Simple use cases.
  expect(numConsecutiveDaysOfWeek([])).toBe(0);
  expect(numConsecutiveDaysOfWeek([2, 3, 4])).toBe(3);
  expect(numConsecutiveDaysOfWeek([0, 1, 2, 3, 4, 5, 6])).toBe(7);
  // It should take "wrap-arounds" at end-of-week into account.
  let i;
  for (i = 0; i < 7; i += 1) {
    expect(numConsecutiveDaysOfWeek([i])).toBe(1);
    expect(numConsecutiveDaysOfWeek([i, (i + 3) % 7])).toBe(1);
    expect(numConsecutiveDaysOfWeek([i, (i + 1) % 7])).toBe(2);
    expect(numConsecutiveDaysOfWeek([i, (i + 1) % 7, (i + 3) % 7])).toBe(2);
  }
  // Fuzz testing for invariants.
  const n = 100;
  const p = 0.5;
  for (i = 0; i < n; i += 1) {
    const randomDaysOfWeek = [];
    for (let j = 0; j < 7; j += 1) {
      if (Math.random() < p) {
        randomDaysOfWeek.push(j);
      }
    }
    const k = numConsecutiveDaysOfWeek(randomDaysOfWeek);
    expect(k).toBeGreaterThanOrEqual(0);
    expect(k).toBeLessThanOrEqual(randomDaysOfWeek.length);
  }
});

test('ValidationsStudyRequest.torontoInternal()', () => {
  const { torontoInternal } = ValidationsStudyRequest.studyRequest.ccEmails.$each;

  expect(torontoInternal('')).toBeFalsy();
  expect(torontoInternal(',,,,,,')).toBeFalsy();
  expect(torontoInternal('foo.bar@gmail.com')).toBeFalsy();
  expect(torontoInternal('Evan.Savage@toronto.ca')).toBeTruthy();
  expect(torontoInternal('toronto.ca')).toBeFalsy();
  expect(torontoInternal('@toronto.ca')).toBeFalsy();
});

test('ValidationsStudyRequest.needsValidDaysOfWeek()', () => {
  const { needsValidDaysOfWeek } = ValidationsStudyRequest.studyRequest.duration;

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
  const { requiredIfOtherHours } = ValidationsStudyRequest.studyRequest.notes;

  expect(requiredIfOtherHours(null, { hours: StudyHours.ROUTINE })).toBeTruthy();
  expect(requiredIfOtherHours('', { hours: StudyHours.SCHOOL })).toBeTruthy();
  expect(requiredIfOtherHours('shopping mall hours', { hours: StudyHours.ROUTINE })).toBeTruthy();

  expect(requiredIfOtherHours(null, { hours: StudyHours.OTHER })).toBeFalsy();
  expect(requiredIfOtherHours('', { hours: StudyHours.OTHER })).toBeFalsy();
  expect(requiredIfOtherHours('shopping mall hours', { hours: StudyHours.OTHER })).toBeTruthy();
});

test('ValidationsStudyRequest.requiredIfUrgent()', () => {
  const { requiredIfUrgent } = ValidationsStudyRequest.studyRequest.urgentReason;

  expect(requiredIfUrgent(null, { urgent: false })).toBeTruthy();
  expect(requiredIfUrgent('', { urgent: false })).toBeTruthy();
  expect(requiredIfUrgent('this is urgent!', { urgent: false })).toBeFalsy();

  expect(requiredIfUrgent(null, { urgent: true })).toBeFalsy();
  expect(requiredIfUrgent('', { urgent: true })).toBeFalsy();
  expect(requiredIfUrgent('this is urgent!', { urgent: true })).toBeTruthy();
});
