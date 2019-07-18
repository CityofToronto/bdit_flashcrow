import {
  getFetchOptions,
  getFetchUrl,
  getQueryString,
} from '@/lib/ApiFetch';

test('getFetchOptions()', () => {
  expect(getFetchOptions()).toEqual({
    credentials: 'include',
    method: 'GET',
    headers: {},
  });
  expect(getFetchOptions({
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    credentials: 'include',
    method: 'GET',
    data: { a: '1', b: ['2', '3'] },
    headers: {},
  });
  expect(getFetchOptions({
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
  expect(getFetchOptions({
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    credentials: 'include',
    method: 'GET',
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
    headers: {},
  });
  expect(getFetchOptions({
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

test('getFetchUrl()', () => {
  expect(getFetchUrl(
    '/foo',
    getFetchOptions(),
  )).toEqual('/api/foo');
  expect(getFetchUrl(
    '/foo',
    getFetchOptions({
      data: { a: '1', b: ['2', '3'] },
    }),
  )).toEqual('/api/foo?a=1&b=2&b=3');
  expect(getFetchUrl(
    '/foo',
    getFetchOptions({
      data: { a: '1', b: ['2', '3'] },
      method: 'POST',
    }),
  )).toEqual('/api/foo');
});

test('getQueryString()', () => {
  expect(getQueryString({})).toEqual('');
  expect(getQueryString({
    a: '1',
  })).toEqual('a=1');
  expect(getQueryString({
    a: 'foo bar',
  })).toEqual('a=foo%20bar');
  expect(getQueryString({
    a: '1',
    b: '2',
  })).toEqual('a=1&b=2');
  expect(getQueryString({
    a: ['1', '2'],
  })).toEqual('a=1&a=2');
});
