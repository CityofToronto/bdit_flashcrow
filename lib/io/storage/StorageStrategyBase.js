/* eslint-disable class-methods-use-this, no-unused-vars */
import { NotImplementedError } from '@/lib/error/MoveErrors';

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
   * @abstract
   * @param {string} namespace
   * @param {string} key
   * @returns {Promise<Buffer?>} value at the given `namespace` and `key`, or `null`
   */
  async get(namespace, key) {
    throw new NotImplementedError();
  }

  /**
   * @abstract
   * @param {string} namespace
   * @param {string} key
   * @param {Buffer} value
   * @returns {Promise<boolean>} whether the operation succeeded
   */
  async put(namespace, key, value) {
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
