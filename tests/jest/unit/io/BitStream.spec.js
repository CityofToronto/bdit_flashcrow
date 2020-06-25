import { BitStreamOverflowError } from '@/lib/error/MoveErrors';
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
