import db from '@/lib/db/db';
import SessionDAO from '@/lib/db/SessionDAO';

afterAll(() => {
  db.$pool.end();
});

test('SessionDAO', async () => {
  const user = { id: 42 };
  const ttl = { days: 1 };

  const session = await SessionDAO.create(user, ttl);
  expect(session.expiresAt).toEqual(session.createdAt.plus(ttl));
  expect(session.userId).toEqual(user.id);
  await expect(SessionDAO.byId(session.id)).resolves.toEqual(session);

  await expect(SessionDAO.delete(session)).resolves.toEqual(true);
  await expect(SessionDAO.byId(session.id)).resolves.toBeNull();
});
