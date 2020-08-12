/* eslint-disable class-methods-use-this, no-unused-vars */
import { NotImplementedError } from '@/lib/error/MoveErrors';

/**
 * Base class for storage strategies in MOVE.
 */
class StorageStrategyBase {
  /**
   * @abstract
   */
  async has(namespace, key) {
    throw new NotImplementedError();
  }

  /**
   * @abstract
   */
  async get(namespace, key) {
    throw new NotImplementedError();
  }

  /**
   * @abstract
   */
  async put(namespace, key, value) {
    throw new NotImplementedError();
  }

  /**
   * @abstract
   */
  async delete(namespace, key, value) {
    throw new NotImplementedError();
  }
}

export default StorageStrategyBase;
