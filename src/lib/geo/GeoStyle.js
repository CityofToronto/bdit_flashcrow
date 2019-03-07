import style from '@/lib/geo/root.json';
import metadata from '@/lib/geo/metadata.json';

let STYLE = null;

/**
 * See http://bl.ocks.org/jgravois/51e2b30e3d6cf6c00f06b263a29108a2 for
 * further details.
 */
function buildStyle() {
  STYLE = {};
  Object.assign(STYLE, style);
  STYLE.sources.esri = {
    type: 'vector',
    scheme: 'xyz',
    tilejson: metadata.tilejson || '2.0.0',
    format: (metadata.tileInfo && metadata.tileInfo.format) || 'pbf',
    maxzoom: 15,
    tiles: [
      `${style.sources.esri.url}/${metadata.tiles[0]}`,
    ],
    description: metadata.description || '',
    name: metadata.name,
  };
  return STYLE;
}

class GeoStyle {
  static get() {
    if (STYLE === null) {
      buildStyle();
    }
    return STYLE;
  }
}

export default GeoStyle;
