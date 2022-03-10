import db from '@/lib/db/db';
import { CentrelineType } from '@/lib/Constants';
import PoiDAO from '@/lib/db/PoiDAO';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

afterAll(() => {
  db.$pool.end();
});

test('PoiDAO.byCentrelineSummary [invalid centreline]', async () => {
  await expect(
    PoiDAO.byCentrelineSummary(-1, -1, 1000),
  ).rejects.toBeInstanceOf(InvalidCentrelineTypeError);
});

test('PoiDAO.byCentrelineSummary', async () => {
  let result = await PoiDAO.byCentrelineSummary(1142194, CentrelineType.SEGMENT, 1000);
  expect(result.hospital).toEqual(null);
  expect(result.school.id).toEqual(998);
  expect(result.school.geom_dist).toBeCloseTo(296.029139382713);
  expect(result.trafficSignals).toEqual([]);

  result = await PoiDAO.byCentrelineSummary(1142194, CentrelineType.SEGMENT, 250);
  expect(result.hospital).toEqual(null);
  expect(result.school).toEqual(null);
  expect(result.trafficSignals).toEqual([]);

  result = await PoiDAO.byCentrelineSummary(13465434, CentrelineType.INTERSECTION, 1000);
  expect(result.hospital.id).toEqual(1497390);
  expect(result.hospital.geom_dist).toBeCloseTo(81.760698352711);
  expect(result.school.id).toEqual(141);
  expect(result.school.geom_dist).toBeCloseTo(57.2059638042636);
  expect(result.trafficSignals[0].px).toEqual(1725);

  result = await PoiDAO.byCentrelineSummary(13465434, CentrelineType.INTERSECTION, 60);
  expect(result.hospital).toEqual(null);
  expect(result.school.id).toEqual(141);
  expect(result.school.geom_dist).toBeCloseTo(57.2059638042636);
  expect(result.trafficSignals[0].px).toEqual(1725);
});
