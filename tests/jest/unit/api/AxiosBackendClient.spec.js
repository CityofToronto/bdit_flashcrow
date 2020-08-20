import AxiosBackendClient from '@/lib/api/AxiosBackendClient';

test('AxiosBackendClient.getAxiosOptions()', () => {
  expect(AxiosBackendClient.getAxiosOptions({})).toEqual({
    method: 'GET',
    headers: {},
    responseType: 'json',
  });
  expect(AxiosBackendClient.getAxiosOptions({
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    method: 'GET',
    params: { a: '1', b: ['2', '3'] },
    headers: {},
    responseType: 'json',
  });
  expect(AxiosBackendClient.getAxiosOptions({
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
  })).toEqual({
    method: 'GET',
    params: { a: '1', b: ['2', '3'] },
    headers: {},
    responseType: 'json',
  });
  expect(() => {
    AxiosBackendClient.getAxiosOptions({
      data: { a: '1', b: ['2', '3'] },
      method: 'POST',
    });
  }).toThrow(Error);
  expect(AxiosBackendClient.getAxiosOptions({
    csrf: 'f00bar',
    method: 'POST',
  })).toEqual({
    method: 'POST',
    headers: {
      'X-CSRF-Token': 'f00bar',
    },
    responseType: 'json',
  });
  expect(AxiosBackendClient.getAxiosOptions({
    csrf: 'f00bar',
    data: { a: '1', b: ['2', '3'] },
    method: 'POST',
  })).toEqual({
    method: 'POST',
    data: { a: '1', b: ['2', '3'] },
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': 'f00bar',
    },
    responseType: 'json',
  });
});
