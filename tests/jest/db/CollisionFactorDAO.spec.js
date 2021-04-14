import db from '@/lib/db/db';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';

afterAll(() => {
  db.$pool.end();
});

test('CollisionFactorDAO', async () => {
  expect(CollisionFactorDAO.isInited()).toBe(false);

  // pre-init
  const collisionFactors = await CollisionFactorDAO.all();
  expect(collisionFactors).toBeInstanceOf(Map);
  expect(collisionFactors.get('acclass')).toBeInstanceOf(Map);
  expect(collisionFactors.get('acclass').get(1)).toEqual({
    code: 'FA',
    description: 'Fatal',
  });
  expect(CollisionFactorDAO.isInited()).toBe(true);

  // post-init: returns cached Map
  const collisionFactors2 = await CollisionFactorDAO.all();
  expect(collisionFactors2).toEqual(collisionFactors);
});
