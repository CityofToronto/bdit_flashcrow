import InjectBackendClient from '@/lib/test/api/InjectBackendClient';

test('InjectBackendClient.getInjectOptions()', () => {
  const client = new InjectBackendClient(null);

  expect(client.getInjectOptions('/foo', {})).toEqual({
    headers: {},
    method: 'GET',
    url: '/foo',
  });
  expect(client.getInjectOptions('/foo', {
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    headers: {},
    method: 'GET',
    url: '/foo?a=1&b=2&b=3',
  });

  client.csrf = 'f00bar';
  expect(client.getInjectOptions('/foo', {
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    headers: {},
    method: 'GET',
    url: '/foo?a=1&b=2&b=3',
  });

  client.csrf = null;
  expect(() => {
    client.getInjectOptions('/foo', {
      data: { a: '1', b: ['2', '3'] },
      method: 'POST',
    });
  }).toThrow(Error);

  client.csrf = 'f00bar';
  expect(client.getInjectOptions('/foo', {
    method: 'POST',
  })).toEqual({
    headers: {
      Cookie: 'csrf=f00bar',
      'X-CSRF-Token': 'f00bar',
    },
    method: 'POST',
    url: '/foo',
  });
  expect(client.getInjectOptions('/foo', {
    data: { a: '1', b: ['2', '3'] },
    method: 'POST',
  })).toEqual({
    headers: {
      Cookie: 'csrf=f00bar',
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'f00bar',
    },
    method: 'POST',
    payload: { a: '1', b: ['2', '3'] },
    url: '/foo',
  });
});
