/* eslint-disable no-bitwise */
import { BitStreamOverflowError } from '@/lib/error/MoveErrors';

/**
 * Represents a fixed-capacity stream of bits that can be written to and read from,
 * for use in algorithms and encodings that require low-level bit manipulation.
 */
class BitStream {
  constructor(bytes) {
    this.bytes = bytes;
    this.bitCapacity = bytes.length * 8;
    this.bitLength = 0;
    this.bitIndex = 0;
  }

  write(n, value) {
    const available = this.bitCapacity - this.bitIndex;
    if (n > available) {
      throw new BitStreamOverflowError(`cannot write ${available} bits: would overflow`);
    }

    let b = 0;
    let i = this.bitIndex >> 3;
    while (b < n) {
      const off = this.bitIndex & 0x7;
      const rest = Math.min(n - b, 8 - off);
      if (rest === 8) {
        const x = (value >> b) & 0xff;
        this.bytes[i] = x;
      } else {
        const mask = 0xff >> (8 - rest);
        const x = (value >> b) & mask;
        this.bytes[i] &= ~(mask << off);
        this.bytes[i] |= (x << off);
      }
      b += rest;
      this.bitIndex += rest;
      i += 1;
    }

    if (this.bitIndex > this.bitLength) {
      this.bitLength = this.bitIndex;
    }
  }

  read(n) {
    const available = this.bitLength - this.bitIndex;
    if (n > available) {
      throw new BitStreamOverflowError(`cannot read ${n} bits: would overflow`);
    }

    let value = 0;
    let b = 0;
    let i = this.bitIndex >> 3;
    while (b < n) {
      const off = this.bitIndex & 0x7;
      const rest = Math.min(n - b, 8 - off);
      if (rest === 8) {
        value |= (this.bytes[i] << b);
      } else {
        const mask = 0xff >> (8 - rest);
        const x = (this.bytes[i] >> off) & mask;
        value |= (x << b);
      }
      b += rest;
      this.bitIndex += rest;
      i += 1;
    }

    return value;
  }

  seek(bitIndex) {
    if (bitIndex < 0 || bitIndex > this.bitLength) {
      throw new BitStreamOverflowError(`cannot seek to ${bitIndex}: would overflow`);
    }
    this.bitIndex = bitIndex;
  }
}

export default BitStream;
