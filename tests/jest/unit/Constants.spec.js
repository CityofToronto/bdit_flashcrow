import {
  HttpStatus,
  ReportParameter,
  StudyHours,
} from '@/lib/Constants';
import { STUDY_HOURS_HINT_OTHER } from '@/lib/i18n/Strings';
import DateTime from '@/lib/time/DateTime';

test('HttpStatus#isOk', () => {
  expect(HttpStatus.OK.isOk()).toBe(true);
  expect(HttpStatus.BAD_REQUEST.isOk()).toBe(false);
});

test('ReportParameter#defaultValue', () => {
  expect(ReportParameter.BOOLEAN.defaultValue()).toEqual(true);
  const defaultValueDate = ReportParameter.DATE.defaultValue({
    state: {
      now: DateTime.fromObject({ year: 2020, month: 3, day: 17 }),
    },
  });
  const defaultValueDateExpected = DateTime.fromObject({ year: 2017, month: 3, day: 17 });
  expect(defaultValueDate.equals(defaultValueDateExpected)).toBe(true);
  expect(ReportParameter.PREVENTABLE_COLLISIONS.defaultValue()).toEqual([0, 0, 0]);
});

test('StudyHours#hint', () => {
  expect(StudyHours.OTHER.hint).toEqual(STUDY_HOURS_HINT_OTHER);
  expect(StudyHours.ROUTINE.hint)
    .toEqual('07:30 -- 09:30, 10:00 -- 12:00, 13:00 -- 15:00, 16:00 -- 18:00');
});
