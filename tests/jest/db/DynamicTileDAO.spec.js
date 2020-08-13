import db from '@/lib/db/db';
import DynamicTileDAO from '@/lib/db/DynamicTileDAO';
import { InvalidDynamicTileLayerError } from '@/lib/error/MoveErrors';

afterAll(() => {
  db.$pool.end();
});

test('DynamicTileDAO.getTileInfo', () => {
  const { EPSG_3857_MAX, EPSG_3857_MIN, EPSG_3857_SIZE } = DynamicTileDAO;
  const res = EPSG_3857_SIZE / 4096;

  expect(DynamicTileDAO.getTileInfo(0, 0, 0)).toEqual({
    bmin: -256,
    bmax: 4352,
    xmin: EPSG_3857_MIN,
    xmax: EPSG_3857_MAX,
    ymin: EPSG_3857_MIN,
    ymax: EPSG_3857_MAX,
    res,
    fx: 1 / res,
    fy: -1 / res,
    xoff: -EPSG_3857_MIN / res,
    yoff: EPSG_3857_MAX / res,
  });
});

function expectValidTileFeature(tileFeature) {
  // all features must have numeric IDs
  expect(tileFeature).toHaveProperty('id');
  expect(typeof tileFeature.id).toBe('number');

  // all features are expected to have `geom` field
  expect(tileFeature).toHaveProperty('geom');

  // `geom` field must be a GeoJSON point with integer coordinates
  expect(tileFeature.geom.type).toEqual('Point');
  expect(tileFeature.geom.coordinates).toHaveLength(2);
  expect(Number.isInteger(tileFeature.geom.coordinates[0])).toBe(true);
  expect(Number.isInteger(tileFeature.geom.coordinates[1])).toBe(true);
}

test('DynamicTileDAO.getTileFeatures', async () => {
  // non-existent layer
  await expect(
    DynamicTileDAO.getTileFeatures('noSuchLayer'),
  ).rejects.toBeInstanceOf(InvalidDynamicTileLayerError);

  // parameterized layer with invalid parameter
  await expect(
    DynamicTileDAO.getTileFeatures('collisionsLevel1'),
  ).rejects.toBeInstanceOf(InvalidDynamicTileLayerError);
  await expect(
    DynamicTileDAO.getTileFeatures('studies:blarghl'),
  ).rejects.toBeInstanceOf(InvalidDynamicTileLayerError);

  // tile outside city boundaries
  await expect(
    DynamicTileDAO.getTileFeatures('hospitalsLevel1', 12, 345, 678),
  ).resolves.toHaveLength(0);

  // tile with features
  const tileFeatures = await DynamicTileDAO.getTileFeatures('collisionsLevel1:3', 16, 18308, 23913);
  expect(tileFeatures.length).toBeGreaterThan(0);
  tileFeatures.forEach(expectValidTileFeature);
});
