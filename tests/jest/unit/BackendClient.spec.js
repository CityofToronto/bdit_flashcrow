import BackendClient from '@/lib/BackendClient';

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
