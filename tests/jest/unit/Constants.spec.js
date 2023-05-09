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
