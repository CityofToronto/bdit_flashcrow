import style from '@/lib/geo/root.json';
import metadata from '@/lib/geo/metadata.json';
//import from '@/lib/geo/root.json';

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
  STYLE.sources.centreline = {
    type: 'vector',
    tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/centreline/{z}/{x}/{y}.pbf'],
  };

  STYLE.sources.intersections = {
    type: 'vector',
    tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/intersections/{z}/{x}/{y}.pbf'],
  };

  STYLE.layers = STYLE.layers.concat([{
    id: 'centreline',
    source: 'centreline',
    'source-layer': 'centreline',
    type: 'line',
    minzoom: 10,
    maxZoom: 15,
  }]);

  STYLE.layers = STYLE.layers.concat([{
    id: 'intersections',
    source: 'intersections',
    'source-layer': 'centreline_intersection',
    type: 'circle',
    minzoom: 11,
    maxZoom: 15,
  }]);

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
