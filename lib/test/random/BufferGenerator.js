import Random from '@/lib/Random';

function generateBuffer(n) {
  const arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = Random.range(0, 256);
  }
  return Buffer.from(arr);
}

const BufferGenerator = {
  generateBuffer,
};

export {
  BufferGenerator as default,
  generateBuffer,
};
