/* eslint-disable no-underscore-dangle */
import { PassThrough } from 'stream';

/**
 * @see https://gist.github.com/brzez/7ccb625f7f431b95f16f13b6c54c6b0e
 * @see https://github.com/outmoded/discuss/issues/618
 */
class SSEStream extends PassThrough {
  constructor() {
    super();
    this._compressor = null;
  }

  _read(size) {
    super._read(size);

    if (this._compressor) {
      this._compressor.flush();
    }
  }

  setCompressor(compressor) {
    this._compressor = compressor;
  }
}

export default SSEStream;
