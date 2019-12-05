const BUFFER = 256;
const EXTENT = 4096;
const VERSION = 2;

function positionToGeometry([x, y]) {
  return { x, y };
}

function coordinatesToGeometry(type, coordinates) {
  if (type === 1) {
    return [[positionToGeometry(coordinates)]];
  }
  if (type === 2) {
    return [coordinates.map(positionToGeometry)];
  }
  // TODO: throw error
  return null;
}

class VectorTileFeature {
  constructor({ id, geom, ...properties }) {
    this.id = id;
    this.properties = properties;
    this.initGeometry(geom);
  }

  initGeometry(geom) {
    const { type, coordinates } = geom;
    // TODO: handle case where GeomType doesn't have property
    this.type = VectorTileFeature.GeomType[type];
    this.geometry = coordinatesToGeometry(this.type, coordinates);
  }

  loadGeometry() {
    return this.geometry;
  }
}
// TODO: handle polygons, multi-types
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

export default VectorTile;
