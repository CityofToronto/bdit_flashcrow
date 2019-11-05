function streamToString(readableStream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    readableStream.on('data', chunk => chunks.push(chunk));
    readableStream.on('error', reject);
    readableStream.on('end', () => {
      const str = Buffer.concat(chunks).toString('utf8');
      resolve(str);
    });
  });
}

const StreamUtils = {
  streamToString,
};

export {
  StreamUtils as default,
  streamToString,
};
