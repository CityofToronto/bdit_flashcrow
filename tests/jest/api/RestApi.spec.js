import RestApiTestUtils from '@/lib/test/RestApiTestUtils';

beforeAll(RestApiTestUtils.startup, RestApiTestUtils.TIMEOUT);
afterAll(RestApiTestUtils.shutdown, RestApiTestUtils.TIMEOUT);

test('authentication works', async () => {
  let response;

  response = await RestApiTestUtils.callApi('/auth');
  expect(response.loggedIn).toBe(false);

  await RestApiTestUtils.login();
  response = await RestApiTestUtils.callApi('/auth');
  expect(response.loggedIn).toBe(true);

  await RestApiTestUtils.logout();
  response = await RestApiTestUtils.callApi('/auth');
  expect(response.loggedIn).toBe(false);
});
