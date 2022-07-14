import fs from 'fs';
import path from 'path';

import StorageHash from '@/lib/io/storage/StorageHash';
import StorageStrategyBase from '@/lib/io/storage/StorageStrategyBase';

/**
 * On-disk implementation of {@link StorageStrategyBase}.  Files are stored under a `root`
 * directory, with `namespace` used as a subfolder of `root`.  Since filesystem performance
 * can suffer from having too many files in the same directory, we use a hash of `key` to
 * store files in a nested partitioned structure.  This hash is also prepended to `key` to
 * form the filename, in case we need to change the nesting level of this structure later.
 *
 * @param {string} root - path to root directory of storage
 */
class StorageStrategyFilesystem extends StorageStrategyBase {
  constructor(root) {
    super();
    this.root = root;
  }

  /**
   * Get the full on-disk path to the given `namespace` and `key`.  We use `path` / `indexOf`
   * checks to guard against directory traversal attempts - since `namespace` and `key` can
   * both be used in this way, we must check after each one is added to the path.
   *
   * This is important, as {@link StorageController.getStorage} accepts `namespace` and `key`
   * parameters from the user.  Every method in {@link StorageStrategyFilesystem} MUST call
   * this.
   *
   * @param {string} namespace
   * @param {string} key
   * @returns {string} full path to file at given `namespace` and `key`, including the `root`
   * and hashed partitioning
   */
  getFullPath(namespace, key, hashPath = true) {
    const { root } = this;
    const namespaceDir = path.join(root, namespace);
    if (namespaceDir.indexOf(root) !== 0) {
      throw new Error('directory traversal not allowed');
    }

    let fullPath = path.join(namespaceDir, key);
    if (hashPath) {
      const hash = StorageHash.get(key);
      const a = hash.slice(0, 2);
      const b = hash.slice(2, 4);
      const fullDir = path.join(namespaceDir, a, b);

      fullPath = path.join(fullDir, `${hash}_${key}`);
      if (path.dirname(fullPath) !== fullDir) {
        throw new Error('directory traversal not allowed');
      }
    }

    return fullPath;
  }

  async has(namespace, key, hashPath = true) {
    const fullPath = this.getFullPath(namespace, key, hashPath);
    try {
      /* eslint-disable-next-line no-bitwise */
      await fs.promises.access(fullPath, fs.constants.W_OK | fs.constants.R_OK);
      return true;
    } catch (err) {
      return false;
    }
  }

  getStream(namespace, key, hashPath = true) {
    const fullPath = this.getFullPath(namespace, key, hashPath);
    return fs.createReadStream(fullPath);
  }

  async putStream(namespace, key, valueStream, hashPath = true) {
    const fullPath = this.getFullPath(namespace, key, hashPath);
    const dir = path.dirname(fullPath);
    await fs.promises.mkdir(dir, { recursive: true });
    const writeStream = fs.createWriteStream(fullPath);
    valueStream.pipe(writeStream);
    return writeStream;
  }

  async delete(namespace, key) {
    const fullPath = this.getFullPath(namespace, key);
    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default StorageStrategyFilesystem;
