import {
  getFetchOptions,
  getFetchUrl,
  getQueryString,
} from '@/lib/ApiFetch';

test('getFetchOptions()', () => {
  expect(getFetchOptions()).toEqual({
    credentials: 'include',
    method: 'GET',
  });
  expect(getFetchOptions({
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    credentials: 'include',
    method: 'GET',
    data: { a: '1', b: ['2', '3'] },
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
});

test('getFetchUrl()', () => {
  expect(getFetchUrl(
    '/foo',
    getFetchOptions(),
  )).toEqual('/flashcrow/api/foo');
  expect(getFetchUrl(
    '/foo',
    getFetchOptions({
      data: { a: '1', b: ['2', '3'] },
    }),
  )).toEqual('/flashcrow/api/foo?a=1&b=2&b=3');
  expect(getFetchUrl(
    '/foo',
    getFetchOptions({
      data: { a: '1', b: ['2', '3'] },
      method: 'POST',
    }),
  )).toEqual('/flashcrow/api/foo');
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
