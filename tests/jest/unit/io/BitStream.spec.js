import Random from '@/lib/Random';
import {
  BitStreamOverflowError,
  BitStreamSerializationError,
} from '@/lib/error/MoveErrors';
import BitStream from '@/lib/io/BitStream';

test('BitStream [zero capacity]', () => {
  const bytes = new Uint8Array(0);
  const bitStream = new BitStream(bytes);
  expect(bitStream.bitCapacity).toBe(0);
  expect(bitStream.bitIndex).toBe(0);
  expect(bitStream.bitLength).toBe(0);

  expect(() => {
    bitStream.write(1, 0x1);
  }).toThrow(BitStreamOverflowError);

  expect(() => {
    bitStream.seek(1);
  }).toThrow(BitStreamOverflowError);

  expect(() => {
    bitStream.read(1);
  }).toThrow(BitStreamOverflowError);
});

test('BitStream [empty]', () => {
  const bytes = new Uint8Array(1);
  const bitStream = new BitStream(bytes);
  expect(bitStream.bitCapacity).toBe(8);
  expect(bitStream.bitIndex).toBe(0);
  expect(bitStream.bitLength).toBe(0);

  expect(() => {
    bitStream.read(1);
  }).toThrow(BitStreamOverflowError);
});

test('BitStream [single bit seek]', () => {
  const bytes = new Uint8Array(1);
  const bitStream = new BitStream(bytes);

  bitStream.write(1, 0x1);
  expect(bitStream.bitCapacity).toBe(8);
  expect(bitStream.bitIndex).toBe(1);
  expect(bitStream.bitLength).toBe(1);

  // error: must seek to positive index!
  expect(() => {
    bitStream.seek(-1);
  }).toThrow(BitStreamOverflowError);

  // error: cannot seek past length!
  expect(() => {
    bitStream.seek(2);
  }).toThrow(BitStreamOverflowError);

  bitStream.seek(0);
  expect(bitStream.bitCapacity).toBe(8);
  expect(bitStream.bitIndex).toBe(0);
  expect(bitStream.bitLength).toBe(1);
});

test('BitStream [single bit write / read]', () => {
  const bytes = new Uint8Array(1);
  const bitStream = new BitStream(bytes);
  bitStream.write(1, 0x1);
  bitStream.seek(0);
  expect(bitStream.read(1)).toBe(0x1);
  expect(() => {
    bitStream.read(1);
  }).toThrow(BitStreamOverflowError);

  bitStream.seek(0);
  bitStream.write(1, 0x0);
  bitStream.seek(0);
  expect(bitStream.read(1)).toBe(0x0);
});

test('BitStream [single byte write / read]', () => {
  const bytes = new Uint8Array(1);
  const bitStream = new BitStream(bytes);

  bitStream.write(8, 0x96);
  expect(() => {
    bitStream.write(1, 0x1);
  }).toThrow(BitStreamOverflowError);

  bitStream.seek(0);

  expect(bitStream.read(8)).toBe(0x96);
  expect(() => {
    bitStream.read(1);
  }).toThrow(BitStreamOverflowError);
});

test('BitStream [single byte partial write / read]', () => {
  const bytes = new Uint8Array(1);
  const bitStream = new BitStream(bytes);

  bitStream.write(3, 0x6);
  bitStream.write(2, 0x2);
  bitStream.write(2, 0x1);

  bitStream.seek(0);
  expect(() => {
    bitStream.read(8);
  }).toThrow(BitStreamOverflowError);
  expect(bitStream.read(7)).toBe(0x36);

  bitStream.seek(1);
  expect(bitStream.read(4)).toBe(0xb);
  expect(() => {
    bitStream.read(3);
  }).toThrow(BitStreamOverflowError);
  expect(bitStream.read(2)).toBe(0x1);

  bitStream.seek(2);
  expect(bitStream.read(3)).toBe(0x5);
  expect(bitStream.read(1)).toBe(0x1);
  expect(bitStream.read(1)).toBe(0x0);

  bitStream.seek(0);
  expect(bitStream.read(5)).toBe(0x16);
});

test('BitStream [multi-byte write / read]', () => {
  const bytes = new Uint8Array(2);
  const bitStream = new BitStream(bytes);

  bitStream.write(16, 0xbeef);
  bitStream.seek(0);
  expect(bitStream.read(16)).toBe(0xbeef);
});

test('BitStream [multi-byte write, byte-aligned read]', () => {
  const bytes = new Uint8Array(2);
  const bitStream = new BitStream(bytes);

  bitStream.write(16, 0xbeef);
  bitStream.seek(0);
  expect(bitStream.read(8)).toBe(0xef);
  expect(bitStream.read(8)).toBe(0xbe);
});

test('BitStream [multi-byte partial write / read]', () => {
  const bytes = new Uint8Array(2);
  const bitStream = new BitStream(bytes);

  bitStream.write(4, 0xf);
  bitStream.write(6, 0x2e);
  bitStream.write(1, 0x1);
  bitStream.write(5, 0x17);

  bitStream.seek(0);
  expect(bitStream.read(8)).toBe(0xef);
  expect(bitStream.read(8)).toBe(0xbe);

  bitStream.seek(0);
  expect(bitStream.read(12)).toBe(0xeef);

  bitStream.seek(4);
  expect(bitStream.read(12)).toBe(0xbee);

  bitStream.seek(0);
  expect(bitStream.read(4)).toBe(0xf);
  expect(bitStream.read(6)).toBe(0x2e);
  expect(bitStream.read(1)).toBe(0x1);
  expect(bitStream.read(5)).toBe(0x17);

  bitStream.seek(0);
  expect(bitStream.read(3)).toBe(0x7);
  expect(bitStream.read(11)).toBe(0x7dd);
  expect(bitStream.read(2)).toBe(0x2);
});

test('BitStream [fuzz test write / read]', () => {
  for (let i = 0; i < 100; i++) {
    const numBytes = Random.range(1, 20);
    const bytes = new Uint8Array(numBytes);
    const bitStream = new BitStream(bytes);
    while (bitStream.bitIndex < bitStream.bitCapacity) {
      const bitIndexPrev = bitStream.bitIndex;
      let n = Random.range(1, 20);
      if (bitStream.bitIndex + n > bitStream.bitCapacity) {
        n = bitStream.bitCapacity - bitStream.bitIndex;
      }
      const value = Random.range(0, Math.pow(2, n));
      bitStream.write(n, value);
      bitStream.seek(bitIndexPrev);
      expect(bitStream.read(n)).toBe(value);
    }
  }
});

test('BitStream.base64Index', () => {
  expect(() => {
    BitStream.base64Index('+');
  }).toThrow(BitStreamSerializationError);

  for (let i = 0; i < 64; i++) {
    const ord = BitStream.CHARS_BASE_64.charCodeAt(i);
    expect(BitStream.base64Index(ord)).toBe(i);
  }
});

test('BitStream [invalid serialization]', () => {
  expect(() => {
    BitStream.fromString('');
  }).toThrow(BitStreamSerializationError);

  expect(() => {
    BitStream.fromString('blargl:');
  }).toThrow(BitStreamSerializationError);

  expect(() => {
    BitStream.fromString('3f:+%&@*@%');
  }).toThrow(BitStreamSerializationError);
});

function expectBitStreamEquals(bs1, bs2) {
  expect(bs1.bitLength).toBe(bs2.bitLength);
  expect(bs1.bytes).toEqual(bs2.bytes);
}

test('BitStream [empty serialization]', () => {
  const bytes = new Uint8Array(0);
  const bitStream = new BitStream(bytes);
  const str = bitStream.toString();
  const bitStreamCopy = BitStream.fromString(str);
  expectBitStreamEquals(bitStream, bitStreamCopy);
});

test('BitStream [single bit serialization]', () => {
  const bytes = new Uint8Array(1);
  const bitStream = new BitStream(bytes);
  bitStream.write(1, 0x1);
  const str = bitStream.toString();
  const bitStreamCopy = BitStream.fromString(str);
  expectBitStreamEquals(bitStream, bitStreamCopy);
});

test('BitStream [single byte serialization]', () => {
  const bytes = new Uint8Array(1);
  const bitStream = new BitStream(bytes);
  bitStream.write(8, 0x96);
  const str = bitStream.toString();
  const bitStreamCopy = BitStream.fromString(str);
  expectBitStreamEquals(bitStream, bitStreamCopy);
});

test('BitStream [multi-byte serialization]', () => {
  const bytes = new Uint8Array(2);
  const bitStream = new BitStream(bytes);
  bitStream.write(16, 0xbeef);
  const str = bitStream.toString();
  const bitStreamCopy = BitStream.fromString(str);
  expectBitStreamEquals(bitStream, bitStreamCopy);
});

test('BitStream [fuzz test serialization]', () => {
  for (let i = 0; i < 100; i++) {
    const numBytes = Random.range(1, 20);
    const bytes = new Uint8Array(numBytes);
    const bitStream = new BitStream(bytes);
    while (bitStream.bitIndex < bitStream.bitCapacity) {
      let n = Random.range(1, 20);
      if (bitStream.bitIndex + n > bitStream.bitCapacity) {
        n = bitStream.bitCapacity - bitStream.bitIndex;
      }
      const value = Random.range(0, Math.pow(2, n));
      bitStream.write(n, value);
    }
    const str = bitStream.toString();
    const bitStreamCopy = BitStream.fromString(str);
    expectBitStreamEquals(bitStream, bitStreamCopy);
  }
});
