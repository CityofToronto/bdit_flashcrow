import fs from 'fs';
import path from 'path';
import util from 'util';

import StorageHash from '@/lib/io/storage/StorageHash';
import StorageStrategyBase from '@/lib/io/storage/StorageStrategyBase';

const access = util.promisify(fs.access);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

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
   * @param {string} namespace
   * @param {string} key
   * @returns {string} full path to file at given `namespace` and `key`, including the `root`
   * and hashed partitioning
   */
  getFullPath(namespace, key) {
    const { root } = this;
    const hash = StorageHash.get(key);
    const a = hash.slice(0, 2);
    const b = hash.slice(2, 4);
    return path.join(root, namespace, a, b, `${hash}_${key}`);
  }

  async has(namespace, key) {
    const fullPath = this.getFullPath(namespace, key);
    try {
      await access(fullPath);
      return true;
    } catch (err) {
      return false;
    }
  }

  async get(namespace, key) {
    const fullPath = this.getFullPath(namespace, key);
    try {
      const value = await readFile(fullPath);
      return value;
    } catch (err) {
      return null;
    }
  }

  async put(namespace, key, value) {
    const fullPath = this.getFullPath(namespace, key);
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });
    try {
      await writeFile(fullPath, value);
      return true;
    } catch (err) {
      return null;
    }
  }

  async delete(namespace, key) {
    const fullPath = this.getFullPath(namespace, key);
    try {
      await unlink(fullPath);
      return true;
    } catch (err) {
      return false;
    }
  }
}

export default StorageStrategyFilesystem;
