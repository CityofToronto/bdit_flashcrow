import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

test('ValidationsStudyRequest.numConsecutiveDaysOfWeek()', () => {
  // Simple use cases.
  expect(ValidationsStudyRequest.numConsecutiveDaysOfWeek([])).toBe(0);
  expect(ValidationsStudyRequest.numConsecutiveDaysOfWeek([2, 3, 4])).toBe(3);
  expect(ValidationsStudyRequest.numConsecutiveDaysOfWeek([0, 1, 2, 3, 4, 5, 6])).toBe(7);
  // It should take "wrap-arounds" at end-of-week into account.
  let i;
  for (i = 0; i < 7; i += 1) {
    expect(ValidationsStudyRequest.numConsecutiveDaysOfWeek([i])).toBe(1);
    expect(ValidationsStudyRequest.numConsecutiveDaysOfWeek([i, (i + 3) % 7])).toBe(1);
    expect(ValidationsStudyRequest.numConsecutiveDaysOfWeek([i, (i + 1) % 7])).toBe(2);
    expect(ValidationsStudyRequest.numConsecutiveDaysOfWeek([i, (i + 1) % 7, (i + 3) % 7])).toBe(2);
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
    const k = ValidationsStudyRequest.numConsecutiveDaysOfWeek(randomDaysOfWeek);
    expect(k).toBeGreaterThanOrEqual(0);
    expect(k).toBeLessThanOrEqual(randomDaysOfWeek.length);
  }
});

test('ValidationsStudyRequest.torontoInternal()', () => {
  const { torontoInternal } = ValidationsStudyRequest.validations.studyRequest.ccEmails.$each;

  expect(torontoInternal('')).toBeFalsy();
  expect(torontoInternal(',,,,,,')).toBeFalsy();
  expect(torontoInternal('foo.bar@gmail.com')).toBeFalsy();
  expect(torontoInternal('Evan.Savage@toronto.ca')).toBeTruthy();
});

test('ValidationsStudyRequest.needsValidDuration()', () => {
  const { studyRequest } = ValidationsStudyRequest.validations;
  const { needsValidDuration } = studyRequest.studies.$each.daysOfWeek;

  expect(needsValidDuration([], { duration: 24 })).toBeFalsy();
  expect(needsValidDuration([2, 3, 4], { duration: 24 })).toBeTruthy();
  expect(needsValidDuration([2, 3, 4], { duration: 48 })).toBeTruthy();
  expect(needsValidDuration([2, 3, 4], { duration: 72 })).toBeTruthy();
  expect(needsValidDuration([2, 3, 4], { duration: 96 })).toBeFalsy();
  let i;
  for (i = 0; i < 7; i += 1) {
    expect(needsValidDuration([i], { duration: 24 })).toBeTruthy();
    expect(needsValidDuration([i], { duration: 48 })).toBeFalsy();
    expect(needsValidDuration([i, (i + 3) % 7], { duration: 24 })).toBeTruthy();
    expect(needsValidDuration([i, (i + 3) % 7], { duration: 48 })).toBeFalsy();
    expect(needsValidDuration([i, (i + 1) % 7], { duration: 24 })).toBeTruthy();
    expect(needsValidDuration([i, (i + 1) % 7], { duration: 48 })).toBeTruthy();
    expect(needsValidDuration([i, (i + 1) % 7], { duration: 72 })).toBeFalsy();
  }
});

test('ValidationsStudyRequest.needsValidDaysOfWeek()', () => {
  const { studyRequest } = ValidationsStudyRequest.validations;
  const { needsValidDaysOfWeek } = studyRequest.studies.$each.duration;

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
