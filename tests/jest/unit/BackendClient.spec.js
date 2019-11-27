import BackendClient from '@/lib/BackendClient';
import DateTime from '@/lib/time/DateTime';

test('BackendClient.getFetchOptions()', () => {
  expect(BackendClient.getFetchOptions()).toEqual({
    credentials: 'include',
    method: 'GET',
    headers: {},
  });
  expect(BackendClient.getFetchOptions({
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    credentials: 'include',
    method: 'GET',
    data: { a: '1', b: ['2', '3'] },
    headers: {},
  });
  expect(BackendClient.getFetchOptions({
    data: { a: '1', b: ['2', '3'] },
    method: 'POST',
  })).toEqual({
    credentials: 'include',
    method: 'POST',
    data: { a: '1', b: ['2', '3'] },
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{"a":"1","b":["2","3"]}',
  });
  expect(BackendClient.getFetchOptions({
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    credentials: 'include',
    method: 'GET',
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
    headers: {},
  });
  expect(BackendClient.getFetchOptions({
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
    method: 'POST',
  })).toEqual({
    credentials: 'include',
    method: 'POST',
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'f00bar',
    },
    body: '{"a":"1","b":["2","3"]}',
  });
});

test('BackendClient.getFetchUrl()', () => {
  const client = new BackendClient('/rest');
  expect(client.getFetchUrl(
    '/foo',
    BackendClient.getFetchOptions(),
  )).toEqual('/rest/foo');
  expect(client.getFetchUrl(
    '/foo',
    BackendClient.getFetchOptions({
      data: { a: '1', b: ['2', '3'] },
    }),
  )).toEqual('/rest/foo?a=1&b=2&b=3');
  expect(client.getFetchUrl(
    '/foo',
    BackendClient.getFetchOptions({
      data: { a: '1', b: ['2', '3'] },
      method: 'POST',
    }),
  )).toEqual('/rest/foo');
});

test('BackendClient.getQueryString()', () => {
  expect(BackendClient.getQueryString({})).toEqual('');
  expect(BackendClient.getQueryString({
    a: '1',
  })).toEqual('a=1');
  expect(BackendClient.getQueryString({
    a: 'foo bar',
  })).toEqual('a=foo%20bar');
  expect(BackendClient.getQueryString({
    a: '1',
    b: '2',
  })).toEqual('a=1&b=2');
  expect(BackendClient.getQueryString({
    a: ['1', '2'],
  })).toEqual('a=1&a=2');
});

function mockResponseHeaders(contentType) {
  return {
    get(name) {
      if (name === 'Content-Type') {
        return contentType;
      }
      return undefined;
    },
  };
}

const MOCK_REDIRECT_URL = '/mock/redirect/url';

function normalizeResponse(response, status) {
  const ok = status >= 200 && status < 400;
  const redirected = status >= 300 && status < 400;
  const normalizedResponse = {
    ...response,
    ok,
    redirected,
  };
  if (redirected) {
    normalizedResponse.url = MOCK_REDIRECT_URL;
  }
  return normalizedResponse;
}

function mockJsonResponse(jsonResponse, status = 200) {
  const headers = mockResponseHeaders('application/json');
  const response = {
    headers,
    status,
    async text() {
      return JSON.stringify(jsonResponse);
    },
  };
  return normalizeResponse(response, status);
}

function mockBinaryResponse(binaryResponse, status = 200) {
  const headers = mockResponseHeaders(binaryResponse.type);
  const response = {
    async blob() {
      return binaryResponse;
    },
    headers,
    status,
  };
  return normalizeResponse(response, status);
}

test('BackendClient.getResponseBody', async () => {
  const jsonResponse = {
    t: DateTime.local(),
    x: 42,
  };
  let response = mockJsonResponse(jsonResponse);
  await expect(BackendClient.getResponseBody(response)).resolves.toEqual(jsonResponse);

  const binaryResponse = new Blob(['hello, world!'], { type: 'text/plain' });
  response = mockBinaryResponse(binaryResponse);
  await expect(BackendClient.getResponseBody(response)).resolves.toEqual(binaryResponse);
});

test('BackendClient.handleResponse', async () => {
  // HTTP 200
  const jsonResponse = {
    t: DateTime.local(),
    x: 42,
  };
  let response = mockJsonResponse(jsonResponse);
  await expect(BackendClient.handleResponse(response)).resolves.toEqual(jsonResponse);

  const binaryResponse = new Blob(['hello, world!'], { type: 'text/plain' });
  response = mockBinaryResponse(binaryResponse);
  await expect(BackendClient.handleResponse(response)).resolves.toEqual(binaryResponse);

  // HTTP 301: redirect
  response = mockJsonResponse(jsonResponse, 301);
  await expect(BackendClient.handleResponse(response)).resolves.toEqual({
    __redirect: MOCK_REDIRECT_URL,
  });

  // HTTP 400 Bad Request
  response = mockJsonResponse(jsonResponse, 400);
  await expect(BackendClient.handleResponse(response)).rejects.toThrow();
});
