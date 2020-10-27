import db from '@/lib/db/db';
import { CentrelineType } from '@/lib/Constants';
import PoiDAO from '@/lib/db/PoiDAO';

afterAll(() => {
  db.$pool.end();
});

test('PoiDAO.byCentrelineSummary', async () => {
  let result = await PoiDAO.byCentrelineSummary(1142194, CentrelineType.SEGMENT, 1000);
  expect(result).toEqual({
    hospital: null,
    school: { id: 898, geom_dist: 296.029139382713 },
  });

  result = await PoiDAO.byCentrelineSummary(1142194, CentrelineType.SEGMENT, 250);
  expect(result).toEqual({
    hospital: null,
    school: null,
  });

  result = await PoiDAO.byCentrelineSummary(13465434, CentrelineType.INTERSECTION, 1000);
  expect(result).toEqual({
    hospital: { id: 1497390, geom_dist: 81.760698352711 },
    school: { id: 141, geom_dist: 57.2059638042636 },
  });

  result = await PoiDAO.byCentrelineSummary(13465434, CentrelineType.INTERSECTION, 60);
  expect(result).toEqual({
    hospital: null,
    school: { id: 141, geom_dist: 57.2059638042636 },
  });
});
