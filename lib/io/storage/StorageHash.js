import crypto from 'crypto';

class StorageHash {
  static get(key) {
    const hash = crypto
      .createHash('md5')
      .update(key, 'utf8')
      .digest('hex');
    return hash.slice(0, 8);
  }
}

export default StorageHash;
