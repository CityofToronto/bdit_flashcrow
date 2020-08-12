/* eslint-disable no-await-in-loop */
import mockFs from 'mock-fs';

import Random from '@/lib/Random';
import StorageStrategyFilesystem from '@/lib/io/storage/StorageStrategyFilesystem';

beforeEach(() => {
  mockFs({});
});

afterAll(() => {
  mockFs.restore();
});

test('StorageStrategyFilesystem', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage');
  const namespace = 'foo';

  let key = 'bar';
  await expect(storage.has(namespace, key)).resolves.toEqual(false);
  await expect(storage.get(namespace, key)).resolves.toEqual(null);

  let value = Buffer.from('baz');
  await expect(storage.put(namespace, key, value)).resolves.toEqual(true);
  await expect(storage.has(namespace, key)).resolves.toEqual(true);
  await expect(storage.get(namespace, key)).resolves.toEqual(value);

  key = 'zing';
  await expect(storage.put(namespace, key, value)).resolves.toEqual(true);

  key = 'bar';
  value = Buffer.from('frob');
  await expect(storage.put(namespace, key, value)).resolves.toEqual(true);
  await expect(storage.has(namespace, key)).resolves.toEqual(true);
  await expect(storage.get(namespace, key)).resolves.toEqual(value);

  await expect(storage.delete(namespace, key)).resolves.toEqual(true);
  await expect(storage.has(namespace, key)).resolves.toEqual(false);
  await expect(storage.get(namespace, key)).resolves.toEqual(null);

  await expect(storage.delete(namespace, key)).resolves.toEqual(false);
});

function randomBuffer(n) {
  const arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = Random.range(0, 256);
  }
  return Buffer.from(arr);
}

test('StorageStrategyFilesystem [fuzz test]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage');

  for (let i = 0; i < 100; i++) {
    const namespace = Random.choice(['a', 'b', 'c']);
    const key = Random.range(100, 200).toString();
    const n = Random.range(32, 256);
    const value = randomBuffer(n);

    await expect(storage.put(namespace, key, value)).resolves.toEqual(true);
    await expect(storage.has(namespace, key)).resolves.toEqual(true);
    await expect(storage.get(namespace, key)).resolves.toEqual(value);
  }

  for (let i = 0; i < 100; i++) {
    const namespace = Random.choice(['a', 'b', 'c']);
    const key = Random.range(100, 200).toString();
    const hasKey = await storage.has(namespace, key);
    await expect(storage.delete(namespace, key)).resolves.toEqual(hasKey);
  }
});
