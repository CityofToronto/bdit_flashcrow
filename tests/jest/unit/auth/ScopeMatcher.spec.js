import { AuthScope } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';

test('ScopeMatcher.hasAuthScope', () => {
  let user = null;
  expect(hasAuthScope(user, [])).toBe(false);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS])).toBe(false);

  user = {
    scope: [AuthScope.STUDY_REQUESTS],
  };
  expect(hasAuthScope(user, [])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS_ADMIN])).toBe(false);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_ADMIN,
  ])).toBe(true);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS_ADMIN,
    AuthScope.ADMIN,
  ])).toBe(false);

  user = {
    scope: [
      AuthScope.STUDY_REQUESTS,
      AuthScope.STUDY_REQUESTS_ADMIN,
    ],
  };
  expect(hasAuthScope(user, [])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS_ADMIN])).toBe(true);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_ADMIN,
  ])).toBe(true);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS_ADMIN,
    AuthScope.ADMIN,
  ])).toBe(true);
});
