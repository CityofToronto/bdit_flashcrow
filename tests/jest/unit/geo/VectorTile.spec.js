import VectorTile from '@/lib/geo/VectorTile';
import DateTime from '@/lib/time/DateTime';

test('VectorTile.Utils', () => {
  const p = [17, -42];
  expect(VectorTile.Utils.positionToGeometry(p)).toEqual({ x: p[0], y: p[1] });
  expect(VectorTile.Utils.coordinatesToGeometry(1, p)).toEqual([[{ x: p[0], y: p[1] }]]);

  const q = [18, -41];
  const r = [19, -42];
  expect(VectorTile.Utils.coordinatesToGeometry(2, [p, q, r])).toEqual([[
    { x: p[0], y: p[1] },
    { x: q[0], y: q[1] },
    { x: r[0], y: r[1] },
  ]]);

  expect(() => {
    VectorTile.Utils.coordinatesToGeometry(-1, [p, q, r]);
  }).toThrow();
});

test('VectorTile.Feature', () => {
  const createdAt = DateTime.local();
  let featureOptions = {
    id: 1729,
    geom: {
      type: 'Point',
      coordinates: [17, -42],
    },
    createdAt,
    foo: 'bar',
    quux: false,
  };
  let feature = new VectorTile.Feature(featureOptions);
  expect(feature.id).toEqual(featureOptions.id);
  expect(feature.properties).toEqual({
    createdAt: createdAt.toJSON(),
    foo: 'bar',
    quux: false,
  });
  expect(feature.type).toEqual(1);
  expect(feature.loadGeometry()).toEqual([[{ x: 17, y: -42 }]]);

  featureOptions = {
    id: 137,
    geom: {
      type: 'LineString',
      coordinates: [[17, -42], [18, -41], [19, -42]],
    },
  };
  feature = new VectorTile.Feature(featureOptions);
  expect(feature.id).toEqual(featureOptions.id);
  expect(feature.properties).toEqual({});
  expect(feature.type).toEqual(2);
  expect(feature.loadGeometry()).toEqual([[
    { x: 17, y: -42 },
    { x: 18, y: -41 },
    { x: 19, y: -42 },
  ]]);
});

test('VectorTile.Layer', () => {
  const feature1 = {
    id: 1729,
    geom: {
      type: 'Point',
      coordinates: [17, -42],
    },
    foo: 'bar',
    quux: false,
  };
  const feature2 = {
    id: 137,
    geom: {
      type: 'LineString',
      coordinates: [[17, -42], [18, -41], [19, -42]],
    },
  };

  const layer = new VectorTile.Layer('my-layer', [feature1, feature2]);
  expect(layer.version).toEqual(VectorTile.VERSION);
  expect(layer.name).toEqual('my-layer');
  expect(layer.extent).toEqual(VectorTile.EXTENT);
  expect(layer.length).toEqual(2);
  expect(layer.length).toEqual(layer.features.length);

  expect(layer.feature(0)).toEqual(layer.features[0]);
  expect(layer.feature(1)).toEqual(layer.features[1]);
});

test('VectorTile', () => {
  const feature1 = {
    id: 1729,
    geom: {
      type: 'Point',
      coordinates: [17, -42],
    },
    foo: 'bar',
    quux: false,
  };
  const feature2 = {
    id: 137,
    geom: {
      type: 'LineString',
      coordinates: [[17, -42], [18, -41], [19, -42]],
    },
  };

  const tile = new VectorTile('my-layer', [feature1, feature2]);
  expect(tile.layers).toHaveProperty('my-layer');
});
