/* eslint-disable no-bitwise */
import {
  BitStreamOverflowError,
  BitStreamSerializationError,
} from '@/lib/error/MoveErrors';

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
      throw new BitStreamOverflowError(`cannot write ${n} bits: would overflow`);
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

  toString() {
    const bitIndexPrev = this.bitIndex;
    this.seek(0);
    const cs = [];
    const mod = this.bitLength % 6;
    const cMod = BitStream.CHARS_BASE_64[mod];
    cs.push(cMod);
    while (this.bitIndex < this.bitLength) {
      const rest = Math.min(this.bitLength - this.bitIndex, 6);
      const value = this.read(rest);
      const c = BitStream.CHARS_BASE_64[value];
      cs.push(c);
    }
    this.seek(bitIndexPrev);
    return cs.join('');
  }

  static base64Index(ord) {
    if (ord === 0x2d) {
      return 0x3e;
    }
    if (ord === 0x5f) {
      return 0x3f;
    }
    if (ord >= 0x30 && ord <= 0x39) {
      return ord + 0x4;
    }
    if (ord >= 0x41 && ord <= 0x5a) {
      return ord - 0x41;
    }
    if (ord >= 0x61 && ord <= 0x7a) {
      return ord - 0x47;
    }
    throw new BitStreamSerializationError(`invalid character code: ${ord}`);
  }

  /**
   *
   * @param {string} str - string to deserialize
   */
  static fromString(str) {
    const n = str.length - 1;
    if (n < 0) {
      throw new BitStreamSerializationError('expected bitLength % 6, got empty string');
    }
    const ordMod = str.charCodeAt(0);
    const mod = BitStream.base64Index(ordMod);
    if (mod >= 6) {
      throw new BitStreamSerializationError(`expected bitLength % 6, got ${ordMod}`);
    }

    let bitLength = n * 6;
    if (mod !== 0) {
      bitLength -= 6 - mod;
    }
    const numBytes = Math.ceil(bitLength / 8);
    const bytes = new Uint8Array(numBytes);
    const bitStream = new BitStream(bytes);
    for (let i = 0; i < n; i++) {
      const ord = str.charCodeAt(i + 1);
      const value = BitStream.base64Index(ord);
      const rest = Math.min(bitLength - i * 6, 6);
      bitStream.write(rest, value);
    }

    bitStream.bitLength = bitLength;
    bitStream.seek(0);
    return bitStream;
  }
}
BitStream.CHARS_BASE_64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export default BitStream;
