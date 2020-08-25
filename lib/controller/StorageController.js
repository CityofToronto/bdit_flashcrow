import Boom from '@hapi/boom';
import MimeTypes from 'mime-types';

import { HttpStatus } from '@/lib/Constants';
import storageStrategy from '@/lib/io/storage/StorageStrategy';
import Joi from '@/lib/model/Joi';

/**
 * Reporting-related routes.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StorageController = [];

/**
 * Fetch the given report in the given format.
 *
 * @memberof StorageController
 * @name getStorage
 * @type {Hapi.ServerRoute}
 */
StorageController.push({
  method: 'GET',
  path: '/storage/{namespace}/{key}',
  options: {
    validate: {
      params: {
        namespace: Joi.string().required(),
        key: Joi.string().required(),
      },
    },
  },
  handler: async (request, h) => {
    const { namespace, key } = request.params;
    let fileExists;
    try {
      fileExists = await storageStrategy.has(namespace, key);
    } catch (err) {
      const { statusCode } = HttpStatus.BAD_REQUEST;
      return Boom.boomify(err, { statusCode, override: false });
    }
    if (!fileExists) {
      return Boom.notFound(`file not found in storage: ${namespace}/${key}`);
    }

    let mimeType = MimeTypes.lookup(key);
    if (mimeType === false) {
      mimeType = 'application/octet-stream';
    }

    const fileStream = storageStrategy.getStream(namespace, key);
    return h.response(fileStream)
      .type(mimeType);
  },
});

export default StorageController;
