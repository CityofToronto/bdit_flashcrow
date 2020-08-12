/* eslint-disable class-methods-use-this, no-unused-vars */
import { NotImplementedError } from '@/lib/error/MoveErrors';
import {
  bufferToDuplexStream,
  readableStreamToBuffer,
  writableStreamFinish,
} from '@/lib/io/StreamUtils';

/**
 * Base class for file storage strategies in MOVE.  In MOVE, a file storage strategy is
 * essentially a key-value store.  This definition is simple enough to permit a variety of
 * implementations: in-memory, on-disk, in-database, cloud-based (e.g. S3), etc.
 *
 * Files are identified by a `namespace` and a `key`, both of which should be strings containing
 * only characters `[a-zA-Z0-9_\-]`.
 */
class StorageStrategyBase {
  /**
   * @abstract
   * @param {string} namespace
   * @param {string} key
   * @returns {Promise<boolean>} whether a file at the given `namespace` and `key` exists
   */
  async has(namespace, key) {
    throw new NotImplementedError();
  }

  /**
   * @param {string} namespace
   * @param {string} key
   * @returns {Promise<Buffer>} value at the given `namespace` and `key`
   */
  async get(namespace, key) {
    const valueStream = this.getStream(namespace, key);
    return readableStreamToBuffer(valueStream);
  }

  /**
   * @abstract
   * @param {string} namespace
   * @param {string} key
   * @returns {stream.Readable} stream that provides the value at given `namespace` and
   * `key`, or results in `'error'` event otherwise
   */
  getStream(namespace, key) {
    throw new NotImplementedError();
  }

  /**
   * @param {string} namespace
   * @param {string} key
   * @param {Buffer} value
   * @returns {Promise<void>} when the value has finished writing
   */
  async put(namespace, key, value) {
    const valueStream = bufferToDuplexStream(value);
    const writableStream = await this.putStream(namespace, key, valueStream);
    await writableStreamFinish(writableStream);
  }

  /**
   * @abstract
   * @param {string} namespace
   * @param {string} key
   * @param {stream.Duplex} valueStream - stream containing value to store at given `namespace`
   * and `key`
   * @returns {Promise<stream.Writable>} stream being written to, so that caller can listen for
   * `error` and `finish` events
   */
  async putStream(namespace, key, valueStream) {
    throw new NotImplementedError();
  }

  /**
   * @abstract
   * @param {string} namespace
   * @param {string} key
   * @returns {Promise<boolean>} whether the operation succeeded
   */
  async delete(namespace, key) {
    throw new NotImplementedError();
  }
}

export default StorageStrategyBase;
