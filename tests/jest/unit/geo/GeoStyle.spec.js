import { validate } from '@mapbox/mapbox-gl-style-spec';

import GeoStyle from '@/lib/geo/GeoStyle';

test('GeoStyle#get [aerial dark]', () => {
  const options = { aerial: true, dark: true };

  const style = GeoStyle.get(options);
  const errors = validate(style);
  expect(errors).toHaveLength(0);

  const styleCopy = GeoStyle.get(options);
  expect(styleCopy).not.toBe(style);
  expect(styleCopy).toEqual(style);
});

test('GeoStyle#get [aerial light]', () => {
  const options = { aerial: true, dark: false };

  const style = GeoStyle.get(options);
  const errors = validate(style);
  expect(errors).toHaveLength(0);

  const styleCopy = GeoStyle.get(options);
  expect(styleCopy).not.toBe(style);
  expect(styleCopy).toEqual(style);
});

test('GeoStyle#get [map dark]', () => {
  const options = { aerial: false, dark: true };

  const style = GeoStyle.get(options);
  const errors = validate(style);
  expect(errors).toHaveLength(0);

  const styleCopy = GeoStyle.get(options);
  expect(styleCopy).not.toBe(style);
  expect(styleCopy).toEqual(style);
});

test('GeoStyle#get [map light]', () => {
  const options = { aerial: false, dark: false };

  const style = GeoStyle.get(options);
  const errors = validate(style);
  expect(errors).toHaveLength(0);

  const styleCopy = GeoStyle.get(options);
  expect(styleCopy).not.toBe(style);
  expect(styleCopy).toEqual(style);
});
