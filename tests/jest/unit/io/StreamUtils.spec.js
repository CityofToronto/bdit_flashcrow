import stream from 'stream';

import {
  bufferToDuplexStream,
  readableStreamToBuffer,
  readableStreamToString,
  stringToDuplexStream,
  writableStreamFinish,
} from '@/lib/io/StreamUtils';
import { generateBuffer } from '@/lib/test/random/BufferGenerator';

test('StreamUtils [buffer <-> stream, empty]', async () => {
  const buffer = generateBuffer(0);
  const duplexStream = bufferToDuplexStream(buffer);
  expect(duplexStream.readable).toBe(true);
  expect(duplexStream.writable).toBe(true);
  await expect(readableStreamToBuffer(duplexStream)).resolves.toEqual(buffer);
});

test('StreamUtils [buffer <-> stream]', async () => {
  const buffer = generateBuffer(16);
  const duplexStream = bufferToDuplexStream(buffer);
  expect(duplexStream.readable).toBe(true);
  expect(duplexStream.writable).toBe(true);
  await expect(readableStreamToBuffer(duplexStream)).resolves.toEqual(buffer);
});

test('StreamUtils [string <-> stream, empty]', async () => {
  const str = '';
  const duplexStream = stringToDuplexStream(str);
  expect(duplexStream.readable).toBe(true);
  expect(duplexStream.writable).toBe(true);
  await expect(readableStreamToString(duplexStream)).resolves.toEqual(str);
});

test('StreamUtils [string <-> stream]', async () => {
  const str = 'foo-bar-baz';
  const duplexStream = stringToDuplexStream(str);
  expect(duplexStream.readable).toBe(true);
  expect(duplexStream.writable).toBe(true);
  await expect(readableStreamToString(duplexStream)).resolves.toEqual(str);
});

function readableStreamWithError() {
  const buffer = generateBuffer(1024);
  const duplexStream = new stream.PassThrough();
  duplexStream.write(buffer, (err) => {
    if (err) {
      duplexStream.destroy(err);
      return;
    }
    duplexStream.destroy(new Error('oops!'));
  });
  return duplexStream;
}

test('StreamUtils.readableStreamToBuffer [error]', async () => {
  const readableStream = readableStreamWithError();
  await expect(readableStreamToBuffer(readableStream)).rejects.toBeInstanceOf(Error);
});

test('StreamUtils.readableStreamToString [error]', async () => {
  const readableStream = readableStreamWithError();
  await expect(readableStreamToString(readableStream)).rejects.toBeInstanceOf(Error);
});

test('StreamUtils.writableStreamFinish', async () => {
  const buffer = generateBuffer(1024);
  const stream1 = bufferToDuplexStream(buffer);
  const stream2 = new stream.PassThrough();
  stream1.pipe(stream2);
  await expect(writableStreamFinish(stream2)).resolves.toBeUndefined();
  await expect(readableStreamToBuffer(stream2)).resolves.toEqual(buffer);
});
