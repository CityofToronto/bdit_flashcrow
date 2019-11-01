import { reviver } from '@/lib/JsonUtils';
import Random from '@/lib/Random';
import DateTime from '@/lib/time/DateTime';

const TIME_MIN = 0;
const TIME_MAX = 1500000000000;

test('JsonUtils.reviver', () => {
  let json = 'null';
  expect(JSON.parse(json, reviver)).toEqual(null);

  json = '42';
  expect(JSON.parse(json, reviver)).toEqual(42);

  json = 'false';
  expect(JSON.parse(json, reviver)).toEqual(false);

  json = '"Hello, World!"';
  expect(JSON.parse(json, reviver)).toEqual('Hello, World!');

  json = '"1978-03-19 19:47:24.217"';
  expect(JSON.parse(json, reviver)).toBeInstanceOf(DateTime);
});

test('JsonUtils.reviver [roundtrip]', () => {
  for (let i = 0; i < 25; i++) {
    const t = Random.range(TIME_MIN, TIME_MAX);
    const dt = DateTime.fromMillis(t);
    const x = Random.range(42, 1729);
    const original = { dt, x };
    const revived = JSON.parse(JSON.stringify(original), reviver);
    expect(revived).toEqual(original);
  }
});
