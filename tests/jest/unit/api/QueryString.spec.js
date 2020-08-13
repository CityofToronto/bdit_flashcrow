import QueryString from '@/lib/api/QueryString';

test('QueryString.get', () => {
  expect(QueryString.get({})).toEqual('');
  expect(QueryString.get({
    a: '1',
  })).toEqual('a=1');
  expect(QueryString.get({
    a: 'foo bar',
  })).toEqual('a=foo%20bar');
  expect(QueryString.get({
    a: '1',
    b: '2',
  })).toEqual('a=1&b=2');
  expect(QueryString.get({
    a: ['1', '2'],
  })).toEqual('a=1&a=2');
});
