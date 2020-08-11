import fs from 'fs';
import path from 'path';
import util from 'util';

import StorageHash from '@/lib/io/storage/StorageHash';
import StorageStrategyBase from '@/lib/io/storage/StorageStrategyBase';

const access = util.promisify(fs.access);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class StorageStrategyFilesystem extends StorageStrategyBase {
  constructor(root) {
    super();
    this.root = root;
  }

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
    return readFile(fullPath);
  }

  async put(namespace, key, value) {
    const fullPath = this.getFullPath(namespace, key);
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, value);
  }
}

export default StorageStrategyFilesystem;
