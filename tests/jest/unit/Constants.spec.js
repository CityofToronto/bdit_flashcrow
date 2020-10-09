import {
  HttpStatus,
  ReportParameter,
  StudyHours,
  StudyRequestStatus,
} from '@/lib/Constants';
import { STUDY_HOURS_HINT_OTHER } from '@/lib/i18n/Strings';

test('HttpStatus#isOk', () => {
  expect(HttpStatus.OK.isOk()).toBe(true);
  expect(HttpStatus.BAD_REQUEST.isOk()).toBe(false);
});

test('ReportParameter#defaultValue', () => {
  expect(ReportParameter.BOOLEAN.defaultValue()).toEqual(true);
  expect(ReportParameter.DATE_YEAR.defaultValue({
    state: { now: { year: 2020 } },
  })).toEqual(2017);
  expect(ReportParameter.PREVENTABLE_COLLISIONS.defaultValue()).toEqual([0, 0, 0]);
});

test('StudyHours#hint', () => {
  expect(StudyHours.OTHER.hint).toEqual(STUDY_HOURS_HINT_OTHER);
  expect(StudyHours.ROUTINE.hint)
    .toEqual('07:30 -- 09:30, 10:00 -- 12:00, 13:00 -- 15:00, 16:00 -- 18:00');
});

test('StudyRequestStatus#canTransitionTo', () => {
  function expectCanTransitionTo(statusFrom, statusTo, expected = true) {
    const actual = statusFrom.canTransitionTo(statusTo);
    expect(actual).toBe(expected);
  }

  expectCanTransitionTo(StudyRequestStatus.REQUESTED, StudyRequestStatus.CHANGES_NEEDED);
  expectCanTransitionTo(StudyRequestStatus.REQUESTED, StudyRequestStatus.CANCELLED);
  expectCanTransitionTo(StudyRequestStatus.REQUESTED, StudyRequestStatus.ASSIGNED);
  expectCanTransitionTo(StudyRequestStatus.REQUESTED, StudyRequestStatus.REJECTED, false);
  expectCanTransitionTo(StudyRequestStatus.REQUESTED, StudyRequestStatus.COMPLETED, false);

  expectCanTransitionTo(StudyRequestStatus.CHANGES_NEEDED, StudyRequestStatus.REQUESTED);
  expectCanTransitionTo(StudyRequestStatus.CHANGES_NEEDED, StudyRequestStatus.CANCELLED);
  expectCanTransitionTo(StudyRequestStatus.CHANGES_NEEDED, StudyRequestStatus.ASSIGNED);

  expectCanTransitionTo(StudyRequestStatus.CANCELLED, StudyRequestStatus.REQUESTED);

  expectCanTransitionTo(StudyRequestStatus.ASSIGNED, StudyRequestStatus.REQUESTED);
  expectCanTransitionTo(StudyRequestStatus.ASSIGNED, StudyRequestStatus.REJECTED);
  expectCanTransitionTo(StudyRequestStatus.ASSIGNED, StudyRequestStatus.COMPLETED);

  expectCanTransitionTo(StudyRequestStatus.COMPLETED, StudyRequestStatus.ASSIGNED, false);
});

test('StudyRequestStatus#transitionsTo', () => {
  StudyRequestStatus.enumValues.forEach((status) => {
    expect(status.transitionsTo).toBeInstanceOf(Array);
  });
});
