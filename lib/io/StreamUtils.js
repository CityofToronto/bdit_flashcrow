import stream from 'stream';

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

async function readableStreamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const bufs = [];
    readableStream
      .on('error', reject)
      .on('data', buf => bufs.push(buf))
      .on('end', () => resolve(Buffer.concat(bufs)));
  });
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
  writableStreamFinish,
};

export {
  StreamUtils as default,
  bufferToDuplexStream,
  readableStreamToBuffer,
  writableStreamFinish,
};
