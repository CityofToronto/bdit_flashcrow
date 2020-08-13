import stream from 'stream';

const UTF_8 = 'utf8';

function bufferToDuplexStream(buffer) {
  const duplexStream = new stream.PassThrough();
  duplexStream.write(buffer, (err) => {
    if (err) {
      duplexStream.destroy(err);
      return;
    }
    duplexStream.end();
  });
  return duplexStream;
}

async function readableStreamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const bufs = [];
    readableStream
      .on('error', reject)
      .on('data', buf => bufs.push(buf))
      .on('end', () => resolve(Buffer.concat(bufs)));
  });
}

async function readableStreamToString(readableStream) {
  const buffer = await readableStreamToBuffer(readableStream);
  return buffer.toString(UTF_8);
}

function stringToDuplexStream(str) {
  const duplexStream = new stream.PassThrough();
  duplexStream.write(str, UTF_8, (err) => {
    if (err) {
      duplexStream.destroy(err);
      return;
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

/**
 * @namespace
 */
const StreamUtils = {
  bufferToDuplexStream,
  readableStreamToBuffer,
  readableStreamToString,
  stringToDuplexStream,
  writableStreamFinish,
};

export {
  StreamUtils as default,
  bufferToDuplexStream,
  readableStreamToBuffer,
  readableStreamToString,
  stringToDuplexStream,
  writableStreamFinish,
};
