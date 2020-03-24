import vtpbf from 'vt-pbf';
import Joi from '@/lib/model/Joi';

import DynamicTileDAO from '@/lib/db/DynamicTileDAO';
import VectorTile from '@/lib/geo/VectorTile';

/**
 * Endpoints for dynamic tile generation.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const DynamicTileController = [];

/**
 * Get the given tile.
 *
 * @memberof DynamicTileController
 * @name getTestDynamicTile
 * @type {Hapi.ServerRoute}
 */
DynamicTileController.push({
  method: 'GET',
  path: '/dynamicTiles/{layerName}/{z}/{x}/{y}.pbf',
  options: {
    auth: { mode: 'try' },
    validate: {
      params: {
        layerName: Joi.string().valid(
          'collisionsLevel1',
          'counts',
          'hospitalsLevel1',
          'schoolsLevel1',
        ).required(),
        z: Joi.number().integer().min(0).required(),
        x: Joi.number().integer().min(0).required(),
        y: Joi.number().integer().min(0).required(),
      },
    },
  },
  handler: async (request, h) => {
    const {
      layerName,
      z,
      x,
      y,
    } = request.params;
    const features = await DynamicTileDAO.getTileFeatures(layerName, z, x, y);
    const tile = new VectorTile(layerName, features);
    const tileData = vtpbf(tile);
    const tileBuffer = Buffer.from(tileData);
    /*
     * See https://github.com/mapbox/vector-tile-spec/tree/master/2.1#22-multipurpose-internet-mail-extensions-mime
     * for preferred MIME type here.
     */
    return h.response(tileBuffer)
      .encoding('binary')
      .type('application/vnd.mapbox-vector-tile');
  },
});

export default DynamicTileController;
