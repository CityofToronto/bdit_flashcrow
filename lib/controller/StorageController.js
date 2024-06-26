import Boom from '@hapi/boom';
import MimeTypes from 'mime-types';

import { HttpStatus, AuthScope } from '@/lib/Constants';
import storageStrategy from '@/lib/io/storage/StorageStrategy';
import Joi from '@/lib/model/Joi';

import MvcrAccessEventsDAO from '@/lib/db/MvcrAccessEventsDAO';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';

/**
 * Provides read-only access to MOVE file storage.
 *
 * See {@link StorageStrategyBase} for more details on file storage in MOVE.  In these routes,
 * `namespace` and `key` are used as described there.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StorageController = [];

/**
 * Fetch the file at the given `namespace` and `key`.
 *
 * This was originally introduced to allow users to download ZIP archives of
 * reports, as generated by {@link JobController}.
 *
 * Note also that this endpoint does not currently set `Content-Disposition`.  Use `FileSaver`
 * to initiate client-side download of the response body.
 *
 * @memberof StorageController
 * @name getStorage
 * @type {Hapi.ServerRoute}
 */
StorageController.push({
  method: 'GET',
  path: '/storage/{namespace}/{key}',
  options: {
    description: 'Get the stored file at the given namespace / key',
    tags: ['api'],
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

StorageController.push({
  method: 'GET',
  path: '/mvcr/{collisionYear}/{collisionMonth}/{collisionId}',
  options: {
    auth: {
      scope: [AuthScope.MVCR_READ.name],
    },
    description: 'Get the MVCR image corresponding to the collision specified by the params',
    tags: ['api'],
    validate: {
      params: {
        collisionYear: Joi.string().required(),
        collisionMonth: Joi.string().required(),
        collisionId: Joi.string().required(),
      },
    },
  },
  handler: async (request, h) => {
    const { collisionYear, collisionMonth, collisionId } = request.params;
    const subdirectory = `mvcr/${collisionYear}/${collisionMonth}`;
    const mvcrFilename = `mvcr_${collisionYear}_${collisionMonth}_${collisionId}.pdf`;
    const fileExists = await storageStrategy.has(subdirectory, mvcrFilename, false);

    if (!fileExists) {
      const errorMessage = `The requested MVCR ${mvcrFilename} could not be fouund`;
      const boom = Boom.notFound(errorMessage);
      throw boom;
    }

    const file = storageStrategy.getStream(subdirectory, mvcrFilename, false);

    const { id: userId } = request.auth.credentials;
    MvcrAccessEventsDAO.create(userId, [{ collisionId, collisionYear, collisionMonth }]);

    const mimeType = 'application/pdf';
    return h.response(file).type(mimeType)
      .header('Content-Disposition', `inline; filename="${mvcrFilename}"`);
  },
});

StorageController.push({
  method: 'GET',
  path: '/bulk-mvcr/{filename}',
  options: {
    auth: {
      scope: [AuthScope.MVCR_READ.name],
    },
    description: 'Get the zip of MVCRs specified',
    tags: ['api'],
    validate: {
      params: {
        filename: Joi.string().required(),
      },
    },
  },
  handler: async (request, h) => {
    const { filename } = request.params;
    const subdirectory = 'mvcrBulk';
    const fileExists = await storageStrategy.has(subdirectory, filename, false);

    if (!fileExists) {
      const errorMessage = `The requested zip of MVCRs ${filename} could not be fouund`;
      const boom = Boom.notFound(errorMessage);
      throw boom;
    }

    const file = storageStrategy.getStream(subdirectory, filename, false);

    const { id: userId } = request.auth.credentials;
    const jobId = filename.split('_')[1].split('.')[0];
    JobMetadataDAO.byJobId(jobId).then(
      job => MvcrAccessEventsDAO.create(userId, job.metadata.requestedMvcrs),
    );

    const mimeType = 'application/octet-stream';
    return h.response(file).type(mimeType)
      .header('Content-Disposition', `attachment; filename="${filename}"`);
  },
});

StorageController.push({
  method: 'GET',
  path: '/has-mvcr/{collisionYear}/{collisionMonth}/{collisionId}',
  options: {
    description: 'Check to see if there is an MVCR image corresponding to the collision specified by the params',
    tags: ['api'],
    validate: {
      params: {
        collisionYear: Joi.string().required(),
        collisionMonth: Joi.string().required(),
        collisionId: Joi.string().required(),
      },
    },
  },
  handler: async (request, h) => {
    const { collisionYear, collisionMonth, collisionId } = request.params;
    const subdirectory = `mvcr/${collisionYear}/${collisionMonth}`;
    const mvcrFilename = `mvcr_${collisionYear}_${collisionMonth}_${collisionId}.pdf`;
    const fileExists = await storageStrategy.has(subdirectory, mvcrFilename, false);

    return h.response(fileExists);
  },
});

export default StorageController;
