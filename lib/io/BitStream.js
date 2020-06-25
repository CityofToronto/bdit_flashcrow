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

  write(numBits, value) {
    const bitsAvailable = this.bitCapacity - this.bitIndex;
    if (numBits > bitsAvailable) {
      throw new BitStreamOverflowError(`cannot write ${numBits} bits: would overflow`);
    }

    // TODO: write bits
    this.bytes[0] = value;

    this.bitIndex += numBits;
    if (this.bitIndex > this.bitLength) {
      this.bitLength = this.bitIndex;
    }
  }

  read(numBits) {
    const bitsAvailable = this.bitLength - this.bitIndex;
    if (numBits > bitsAvailable) {
      throw new BitStreamOverflowError(`cannot read ${numBits} bits: would overflow`);
    }

    const value = this.bytes[0];
    this.bitIndex += numBits;
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
