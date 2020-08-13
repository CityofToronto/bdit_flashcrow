import crypto from 'crypto';

/**
 * Used by {@link StorageStrategyFilesystem} to form hashes for nested paritioning into
 * subfolders.
 *
 * Note that changing the implementation here will invalidate all previously-generated
 * files, including any files referred to in `pg-boss` job results.
 */
class StorageHash {
  /**
   *
   * @param {string} key
   * @returns {string} hash of given key, truncated to first 8 hex characters
   */
  static get(key) {
    const hash = crypto
      .createHash('md5')
      .update(key, 'utf8')
      .digest('hex');
    return hash.slice(0, 8);
  }
}

export default StorageHash;
