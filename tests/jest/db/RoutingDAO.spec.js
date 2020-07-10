import db from '@/lib/db/db';
import RoutingDAO from '@/lib/db/RoutingDAO';

afterAll(() => {
  db.$pool.end();
});

test('RoutingDAO.getOtherIntersection', () => {
  expect(RoutingDAO.getOtherIntersection([6, 17], 6)).toEqual(17);
  expect(RoutingDAO.getOtherIntersection([6, 17], 17)).toEqual(6);
  expect(RoutingDAO.getOtherIntersection([42], 42)).toEqual(42);
});
