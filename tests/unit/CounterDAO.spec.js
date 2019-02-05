import db from '@/../lib/db/db';
import CounterDAO from '@/../lib/db/CounterDAO';

test('CounterDAO works properly', async () => {
  await expect(CounterDAO.reset()).resolves.toEqual(0);
  await expect(CounterDAO.get()).resolves.toEqual(0);
  await expect(CounterDAO.increment()).resolves.toEqual(1);
  await expect(CounterDAO.get()).resolves.toEqual(1);
  await expect(CounterDAO.increment()).resolves.toEqual(2);
  await expect(CounterDAO.get()).resolves.toEqual(2);
  await expect(CounterDAO.increment()).resolves.toEqual(3);
  await expect(CounterDAO.get()).resolves.toEqual(3);
});

afterAll(async () => {
  db.$pool.end();
});
