// import db from '@/lib/db/db';

class DynamicTileDAO {
  static getTileEnvelope(z, x, y) {
    // TODO: implement this
    return { z, x, y };
  }

  static getTestFeatureId(z, x, y) {
    if (z === 0) {
      return 0;
    }
    const fz = Math.pow(4, z);
    const fx = x * Math.pow(2, z);
    return fz + fx + y;
  }

  static async getTestFeatures(tileEnvelope) {
    // TODO: implement this
    const { z, x, y } = tileEnvelope;
    const id = DynamicTileDAO.getTestFeatureId(z, x, y);
    const geom = {
      type: 'Point',
      coordinates: [2048, 2048],
    };
    return [{
      id,
      geom,
      z,
      x,
      y,
    }];
  }

  static async getTileFeatures(layerName, z, x, y) {
    const tileEnvelope = DynamicTileDAO.getTileEnvelope(z, x, y);
    if (layerName === 'test') {
      return DynamicTileDAO.getTestFeatures(tileEnvelope);
    }
    // TODO: throw an error here
    return [];
  }
}

export default DynamicTileDAO;
