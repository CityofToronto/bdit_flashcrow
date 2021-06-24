import ObjectUtils from '@/lib/ObjectUtils';
import DateTime from '@/lib/time/DateTime';

const BUFFER = 256;
const EXTENT = 4096;
const VERSION = 2;

class VectorTileUtils {
  static positionToGeometry([x, y]) {
    return { x, y };
  }

  static coordinatesToGeometry(type, coordinates) {
    if (type === 1) {
      return [[VectorTileUtils.positionToGeometry(coordinates)]];
    }
    if (type === 2) {
      return [coordinates.map(VectorTileUtils.positionToGeometry)];
    }
    throw new Error(`invalid coordinate type ${type}`);
  }
}

class VectorTileFeature {
  constructor({ id, geom, ...properties }) {
    this.id = id;
    this.properties = ObjectUtils.map(properties, (value) => {
      if (value instanceof DateTime) {
        return value.toJSON();
      }
      return value;
    });
    this.initGeometry(geom);
  }

  initGeometry(geom) {
    const { type, coordinates } = geom;
    this.type = VectorTileFeature.GeomType[type];
    this.geometry = VectorTileUtils.coordinatesToGeometry(this.type, coordinates);
  }

  loadGeometry() {
    return this.geometry;
  }
}

VectorTileFeature.GeomType = {
  Point: 1,
  LineString: 2,
};

class VectorTileLayer {
  constructor(layerName, features) {
    this.version = VERSION;
    this.name = layerName;
    this.extent = EXTENT;
    this.length = features.length;
    this.features = features.map(feature => new VectorTileFeature(feature));
  }

  feature(i) {
    return this.features[i];
  }
}

class VectorTile {
  constructor(layerName, features) {
    this.layers = {};
    this.layers[layerName] = new VectorTileLayer(layerName, features);
  }
}
VectorTile.BUFFER = BUFFER;
VectorTile.EXTENT = EXTENT;
VectorTile.VERSION = VERSION;

VectorTile.Feature = VectorTileFeature;
VectorTile.Layer = VectorTileLayer;
VectorTile.Utils = VectorTileUtils;

export default VectorTile;
