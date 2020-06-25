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

    const off = this.bitIndex;
    const mask = 0xff >> (8 - n);
    const x = (value & mask) << off;
    this.bytes[0] &= ~(mask << off);
    this.bytes[0] |= x;

    this.bitIndex += n;
    if (this.bitIndex > this.bitLength) {
      this.bitLength = this.bitIndex;
    }
  }

  read(n) {
    const available = this.bitLength - this.bitIndex;
    if (n > available) {
      throw new BitStreamOverflowError(`cannot read ${n} bits: would overflow`);
    }

    const off = this.bitIndex;
    const mask = 0xff >> (8 - n);
    const x = (this.bytes[0] >> off) & mask;
    this.bitIndex += n;
    return x;
  }

  seek(bitIndex) {
    if (bitIndex < 0 || bitIndex > this.bitLength) {
      throw new BitStreamOverflowError(`cannot seek to ${bitIndex}: would overflow`);
    }
    this.bitIndex = bitIndex;
  }
}

export default BitStream;
