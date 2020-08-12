/* eslint-disable no-await-in-loop */
import stream from 'stream';

import Random from '@/lib/Random';
import StorageStrategyFilesystem from '@/lib/io/storage/StorageStrategyFilesystem';

jest.mock('fs');

function randomBuffer() {
  const arr = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    arr[i] = Random.range(0, 256);
  }
  return Buffer.from(arr);
}

test('StorageStrategyFilesystem [buffer API]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/buffer');
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

test('StorageStrategyFilesystem [buffer API, fuzz test]', async () => {
  const storage = new StorageStrategyFilesystem('/data/move-storage/buffer');

  for (let i = 0; i < 30; i++) {
    const namespace = Random.choice(['a', 'b', 'c']);
    const key = Random.range(10, 40).toString();
    const value = randomBuffer();

    await expect(storage.put(namespace, key, value)).resolves.toEqual(true);
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

async function readableStreamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const bufs = [];
    readableStream
      .on('error', reject)
      .on('data', buf => bufs.push(buf))
      .on('end', () => resolve(Buffer.concat(bufs)));
  });
}

function bufferToDuplexStream(buffer) {
  const duplexStream = new stream.PassThrough();
  duplexStream.write(buffer, (err) => {
    if (err) {
      throw err;
    }
    duplexStream.end();
  });
  return duplexStream;
}

async function writableStreamFinish(writableStream) {
  return new Promise((resolve, reject) => {
    writableStream
      .on('error', reject)
      .on('finish', () => resolve());
  });
}

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
    const value = randomBuffer();
    const valueStream = bufferToDuplexStream(value);
    const writableStream = await storage.putStream(namespace, key, valueStream);
    await writableStreamFinish(writableStream);
    await expect(storage.has(namespace, key)).resolves.toEqual(true);
    await expect(storage.get(namespace, key)).resolves.toEqual(value);
  }
});
