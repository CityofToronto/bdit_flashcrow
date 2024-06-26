/* eslint-disable no-await-in-loop */
import Random from '@/lib/Random';
import {
  bufferToDuplexStream,
  readableStreamToBuffer,
  writableStreamFinish,
} from '@/lib/io/StreamUtils';
import StorageStrategyFilesystem from '@/lib/io/storage/StorageStrategyFilesystem';
import { generateBuffer } from '@/lib/test/random/BufferGenerator';

jest.mock('fs');

test('StorageStrategyFilesystem [buffer API]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/buffer');
  const namespace = 'foo';

  let key = 'bar';
  await expect(storage.has(namespace, key)).resolves.toEqual(false);
  await expect(storage.get(namespace, key)).rejects.toBeInstanceOf(Error);

  let value = Buffer.from('baz');
  await expect(storage.put(namespace, key, value)).resolves.toBeUndefined();
  await expect(storage.has(namespace, key)).resolves.toEqual(true);
  await expect(storage.get(namespace, key)).resolves.toEqual(value);

  key = 'zing';
  await expect(storage.put(namespace, key, value)).resolves.toBeUndefined();

  key = 'bar';
  value = Buffer.from('frob');
  await expect(storage.put(namespace, key, value)).resolves.toBeUndefined();
  await expect(storage.has(namespace, key)).resolves.toEqual(true);
  await expect(storage.get(namespace, key)).resolves.toEqual(value);

  await expect(storage.delete(namespace, key)).resolves.toEqual(true);
  await expect(storage.has(namespace, key)).resolves.toEqual(false);
  await expect(storage.get(namespace, key)).rejects.toBeInstanceOf(Error);

  await expect(storage.delete(namespace, key)).resolves.toEqual(false);
});

test('StorageStrategyFilesystem [buffer API, fuzz test]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/buffer');

  for (let i = 0; i < 30; i++) {
    const namespace = Random.choice(['a', 'b', 'c']);
    const key = Random.range(10, 40).toString();
    const value = generateBuffer(8);

    await expect(storage.put(namespace, key, value)).resolves.toBeUndefined();
    await expect(storage.has(namespace, key)).resolves.toEqual(true);
    await expect(storage.get(namespace, key)).resolves.toEqual(value);
  }

  for (let i = 0; i < 30; i++) {
    const namespace = Random.choice(['a', 'b', 'c']);
    const key = Random.range(10, 40).toString();
    const hasKey = await storage.has(namespace, key);
    await expect(storage.delete(namespace, key)).resolves.toEqual(hasKey);
    await expect(storage.has(namespace, key)).resolves.toEqual(false);
  }
});

test('StorageStrategyFilesystem [buffer API, directory traversal]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/buffer');

  let namespace = '../..';
  let key = 'bar';
  const value = Buffer.from('baz');
  await expect(storage.put(namespace, key, value)).rejects.toBeInstanceOf(Error);
  await expect(storage.has(namespace, key)).rejects.toBeInstanceOf(Error);
  await expect(storage.get(namespace, key)).rejects.toBeInstanceOf(Error);

  namespace = 'bar';
  key = '../..';
  await expect(storage.put(namespace, key, value)).rejects.toBeInstanceOf(Error);
  await expect(storage.has(namespace, key)).rejects.toBeInstanceOf(Error);
  await expect(storage.get(namespace, key)).rejects.toBeInstanceOf(Error);
});

test('StorageStrategyFilesystem [stream API]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/stream');
  const namespace = 'foo';

  let key = 'bar';
  await expect(storage.has(namespace, key)).resolves.toEqual(false);
  let valueStream = storage.getStream(namespace, key);
  await expect(readableStreamToBuffer(valueStream)).rejects.toBeInstanceOf(Error);

  let value = Buffer.from('baz');
  valueStream = bufferToDuplexStream(value);
  let writableStream = await storage.putStream(namespace, key, valueStream);
  await writableStreamFinish(writableStream);
  await expect(storage.has(namespace, key)).resolves.toEqual(true);
  valueStream = storage.getStream(namespace, key);
  await expect(readableStreamToBuffer(valueStream)).resolves.toEqual(value);

  key = 'zing';
  writableStream = await storage.putStream(namespace, key, valueStream);
  await writableStreamFinish(writableStream);

  key = 'bar';
  value = Buffer.from('frob');
  valueStream = bufferToDuplexStream(value);
  writableStream = await storage.putStream(namespace, key, valueStream);
  await writableStreamFinish(writableStream);
  await expect(storage.has(namespace, key)).resolves.toEqual(true);
  valueStream = storage.getStream(namespace, key);
  await expect(readableStreamToBuffer(valueStream)).resolves.toEqual(value);

  await expect(storage.delete(namespace, key)).resolves.toEqual(true);
  await expect(storage.has(namespace, key)).resolves.toEqual(false);
  valueStream = storage.getStream(namespace, key);
  await expect(readableStreamToBuffer(valueStream)).rejects.toBeInstanceOf(Error);

  await expect(storage.delete(namespace, key)).resolves.toEqual(false);
});

test('StorageStrategyFilesystem [stream API, fuzz test]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/stream');

  for (let i = 0; i < 30; i++) {
    const namespace = Random.choice(['a', 'b', 'c']);
    const key = Random.range(10, 40).toString();
    const value = generateBuffer(8);
    let valueStream = bufferToDuplexStream(value);
    const writableStream = await storage.putStream(namespace, key, valueStream);
    await writableStreamFinish(writableStream);
    await expect(storage.has(namespace, key)).resolves.toEqual(true);
    valueStream = storage.getStream(namespace, key);
    await expect(readableStreamToBuffer(valueStream)).resolves.toEqual(value);
  }
});

test('StorageStrategyFilesystem [stream API, directory traversal]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/stream');

  let namespace = '../..';
  let key = 'bar';
  const value = Buffer.from('baz');
  const valueStream = bufferToDuplexStream(value);
  await expect(storage.putStream(namespace, key, valueStream)).rejects.toBeInstanceOf(Error);
  await expect(storage.has(namespace, key)).rejects.toBeInstanceOf(Error);
  expect(() => {
    storage.getStream(namespace, key);
  }).toThrow(Error);

  namespace = 'bar';
  key = '../..';
  await expect(storage.putStream(namespace, key, valueStream)).rejects.toBeInstanceOf(Error);
  await expect(storage.has(namespace, key)).rejects.toBeInstanceOf(Error);
  expect(() => {
    storage.getStream(namespace, key);
  }).toThrow(Error);
});

describe('getFullPath when hashPath is false', () => {
  const storage = new StorageStrategyFilesystem('/move-storage');
  const subDirectoryName = 'subdirectory';
  const filename = 'filename.txt';

  test('returns a path WITHOUT additional hashed subfolders', () => {
    const path = storage.getFullPath(subDirectoryName, filename, false);
    expect(path).toEqual(`/move-storage/${subDirectoryName}/${filename}`);
  });
});
