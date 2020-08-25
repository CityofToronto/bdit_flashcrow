import { AuthScope } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';

test('ScopeMatcher.hasAuthScope', () => {
  let user = null;
  expect(hasAuthScope(user, [])).toBe(false);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS])).toBe(false);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_EDIT,
  ])).toBe(false);

  user = {
    scope: [AuthScope.STUDY_REQUESTS],
  };
  expect(hasAuthScope(user, [])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS_EDIT])).toBe(false);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_EDIT,
  ])).toBe(true);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS_ADMIN,
    AuthScope.STUDY_REQUESTS_EDIT,
  ])).toBe(false);

  user = {
    scope: [
      AuthScope.STUDY_REQUESTS,
      AuthScope.STUDY_REQUESTS_EDIT,
    ],
  };
  expect(hasAuthScope(user, [])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS])).toBe(true);
  expect(hasAuthScope(user, [AuthScope.STUDY_REQUESTS_EDIT])).toBe(true);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_EDIT,
  ])).toBe(true);
  expect(hasAuthScope(user, [
    AuthScope.STUDY_REQUESTS_ADMIN,
    AuthScope.STUDY_REQUESTS_EDIT,
  ])).toBe(true);
});
