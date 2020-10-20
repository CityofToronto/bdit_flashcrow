import vtpbf from 'vt-pbf';
import Joi from '@/lib/model/Joi';

import DynamicTileDAO from '@/lib/db/DynamicTileDAO';
import VectorTile from '@/lib/geo/VectorTile';

/**
 * Routes for dynamic tile generation.
 *
 * These return vector tiles in a binary protocol buffer-based format used by Mapbox GL,
 * and are intended for use within Mapbox GL layers and styles.
 *
 * @type {Array<Hapi.ServerRoute>}
 * @see https://developers.google.com/protocol-buffers
 * @see https://docs.mapbox.com/vector-tiles/specification/
 * @see https://docs.mapbox.com/mapbox-gl-js/style-spec/
 */
const DynamicTileController = [];

/**
 * Get the vector tile of the given `layerName` at the tile coordinates `(z, x, y)`.
 *
 * Note that it is possible to provide `(z, x, y)` tile coordinates that are outside
 * Mapbox GL zoom / pan bounds.  In these cases, this still returns a vector tile,
 * albeit one with no features.  (We should probably HTTP 404 in this case.)
 *
 * HTTP 400 if MOVE has no vector tile layer of the given `layerName`.  (We should also
 * probably HTTP 404 in this case.)
 *
 * @memberof DynamicTileController
 * @name getDynamicTile
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
          'collisionsLevel1:1',
          'collisionsLevel1:3',
          'collisionsLevel1:5',
          'collisionsLevel1:10',
          'hospitalsLevel1',
          'schoolsLevel1',
          'studies:1',
          'studies:3',
          'studies:5',
          'studies:10',
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
