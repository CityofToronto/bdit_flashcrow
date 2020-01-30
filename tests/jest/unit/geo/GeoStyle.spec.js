import { validate } from '@mapbox/mapbox-gl-style-spec';

import rootStyleDark from '@/lib/geo/theme/dark/root.json';
import metadataDark from '@/lib/geo/theme/dark/metadata.json';
import rootStyleLight from '@/lib/geo/theme/light/root.json';
import metadataLight from '@/lib/geo/theme/light/metadata.json';
import GeoStyle from '@/lib/geo/GeoStyle';

test('GeoStyle#get [dark]', () => {
  const mapStyle = new GeoStyle(rootStyleDark, metadataDark);

  const { style } = mapStyle;
  const errors = validate(style);
  expect(errors).toHaveLength(0);

  const styleCopy = mapStyle.get();
  expect(styleCopy).not.toBe(style);
  expect(styleCopy).toEqual(style);
});

test('GeoStyle#get [light]', () => {
  const mapStyle = new GeoStyle(rootStyleLight, metadataLight);

  const { style } = mapStyle;
  const errors = validate(style);
  expect(errors).toHaveLength(0);

  const styleCopy = mapStyle.get();
  expect(styleCopy).not.toBe(style);
  expect(styleCopy).toEqual(style);
});
