import db from '@/lib/db/db';
import { CentrelineType } from '@/lib/Constants';
import PoiDAO from '@/lib/db/PoiDAO';

afterAll(() => {
  db.$pool.end();
});

test('PoiDAO.byCentrelineSummary', async () => {
  let result = await PoiDAO.byCentrelineSummary(1142194, CentrelineType.SEGMENT);
  expect(result).toHaveProperty('hospital');
  expect(result).toHaveProperty('school');

  result = await PoiDAO.byCentrelineSummary(13465434, CentrelineType.INTERSECTION);
  expect(result).toHaveProperty('hospital');
  expect(result).toHaveProperty('school');
});
