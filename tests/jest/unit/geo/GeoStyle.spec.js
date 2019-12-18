import { validate } from '@mapbox/mapbox-gl-style-spec';

import rootStyle from '@/lib/geo/root.json';
import metadata from '@/lib/geo/metadata.json';
import GeoStyle from '@/lib/geo/GeoStyle';

test('GeoStyle#get', () => {
  const mapStyle = new GeoStyle(rootStyle, metadata);

  const { style } = mapStyle;
  const errors = validate(style);
  expect(errors).toHaveLength(0);

  const styleCopy = mapStyle.get();
  expect(styleCopy).not.toBe(style);
  expect(styleCopy).toEqual(style);
});
