import { validate } from '@mapbox/mapbox-gl-style-spec';

import Random from '@/lib/Random';
import GeoStyle from '@/lib/geo/GeoStyle';
import { generateFilters } from '@/lib/test/random/FilterGenerator';

const CHOICES_BOOL = [true, false];

test('GeoStyle#get [fuzz test]', () => {
  for (let i = 0; i < 10; i++) {
    const aerial = Random.choice(CHOICES_BOOL);
    const dark = Random.choice(CHOICES_BOOL);
    const filters = generateFilters();
    const layers = {
      counts: Random.choice(CHOICES_BOOL),
      collisions: Random.choice(CHOICES_BOOL),
      volume: Random.choice(CHOICES_BOOL),
    };

    const options = {
      aerial,
      dark,
      ...filters,
      layers,
    };

    const style = GeoStyle.get(options);
    const errors = validate(style);
    expect(errors).toHaveLength(0);

    const styleCopy = GeoStyle.get(options);
    expect(styleCopy).not.toBe(style);
    expect(styleCopy).toEqual(style);
  }
});
