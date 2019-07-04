import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';

test('GeometryUtils.getLineStringMidpoint()', () => {
  expect(getLineStringMidpoint([[0, 0], [1, 1]])).toEqual([0.5, 0.5]);
  expect(getLineStringMidpoint([[0, 0], [1, 1], [2, 2]])).toEqual([1, 1]);
});
