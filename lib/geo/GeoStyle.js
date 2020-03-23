import { MapZoom } from '@/lib/Constants';
import rootStyleDark from '@/lib/geo/theme/dark/root.json';
import metadataDark from '@/lib/geo/theme/dark/metadata.json';
import rootStyleLight from '@/lib/geo/theme/light/root.json';
import metadataLight from '@/lib/geo/theme/light/metadata.json';

// BASEMAP LAYERS

/**
 * Normalizes map styles from ArcGIS / ESRI into the Mapbox GL Style Specification format.
 * These styles are loaded into `bdit_flashcrow` via `scripts/geo/fetch-esri-style.sh`,
 * along with the associated metadata.  Both style and metadata can then be passed into
 * `new GeoStyle()` to build a `mapbox-gl`-compatible style object.
 *
 * @see https://docs.mapbox.com/mapbox-gl-js/style-spec/
 * @see http://bl.ocks.org/jgravois/51e2b30e3d6cf6c00f06b263a29108a2
 * @param {Object} root - ArcGIS / ESRI map root style
 * @param {Object} metadata - ArcGIS / ESRI map style metadata
 */
function mergeRootAndMetadata(root, metadata) {
  const style = JSON.parse(JSON.stringify(root));
  style.sources.esri = {
    type: 'vector',
    scheme: 'xyz',
    tilejson: metadata.tilejson || '2.0.0',
    format: (metadata.tileInfo && metadata.tileInfo.format) || 'pbf',
    maxzoom: 15,
    tiles: [
      `${style.sources.esri.url}${metadata.tiles[0]}`,
    ],
    description: metadata.description || '',
    name: metadata.name,
  };
  return style;
}

const TEXT_FONT_MAP = new Map([
  ['Ubuntu Bold', 'Roboto Bold'],
  ['Ubuntu Italic', 'Roboto Italic'],
  ['Ubuntu Light Regular', 'Roboto Regular'],
  ['Ubuntu Regular', 'Roboto Medium'],
]);

function mapTextFont(textFont) {
  return textFont.map((font) => {
    if (TEXT_FONT_MAP.has(font)) {
      return TEXT_FONT_MAP.get(font);
    }
    return font;
  });
}

const TEXT_SIZE_FACTOR = 1.15;

function mapTextSize(textSize) {
  if (Number.isFinite(textSize)) {
    // single number
    return textSize * TEXT_SIZE_FACTOR;
  }
  if (Object.prototype.hasOwnProperty.call(textSize, 'stops')) {
    // stops expression
    let { stops } = textSize;
    stops = stops.map(([zoom, value]) => [zoom, value * TEXT_SIZE_FACTOR]);
    return {
      ...textSize,
      stops,
    };
  }
  return textSize;
}

function separateLayers(style) {
  const nonSymbolLayers = [];
  const symbolLayers = [];

  style.layers.forEach((layer) => {
    const { layout = {}, type } = layer;
    const { 'text-field': textField = null } = layout;
    if (type === 'symbol' && textField !== null) {
      symbolLayers.push(layer);
    } else {
      nonSymbolLayers.push(layer);
    }
  });

  symbolLayers.forEach((layer) => {
    const { layout, paint } = layer;

    layout['text-font'] = mapTextFont(layout['text-font']);
    layout['text-size'] = mapTextSize(layout['text-size']);

    paint['text-color'] = '#272727';
    paint['text-halo-blur'] = 0;
    paint['text-halo-color'] = '#ffffff';
    paint['text-halo-width'] = 1;
  });

  /* eslint-disable-next-line no-param-reassign */
  style.layers = [];
  return [nonSymbolLayers, symbolLayers];
}

function generateBasemapStyle(root, metadata) {
  const style = mergeRootAndMetadata(root, metadata);
  const [nonSymbolLayers, symbolLayers] = separateLayers(style);
  return {
    style,
    nonSymbolLayers,
    symbolLayers,
  };
}

const {
  style: STYLE_BASE_MAP_DARK,
  nonSymbolLayers: LAYERS_NON_SYMBOL_MAP_DARK,
  symbolLayers: LAYERS_SYMBOL_DARK,
} = generateBasemapStyle(rootStyleDark, metadataDark);

const STYLE_BASE_MAP_LIGHT = mergeRootAndMetadata(rootStyleLight, metadataLight);
const [
  LAYERS_NON_SYMBOL_MAP_LIGHT,
  LAYERS_SYMBOL_LIGHT,
] = separateLayers(STYLE_BASE_MAP_LIGHT);

const STYLE_BASE_AERIAL = {
  version: 8,
  sources: {
    ...STYLE_BASE_MAP_LIGHT.sources,
    'gcc-ortho-webm': {
      type: 'raster',
      tiles: [
        'https://gis.toronto.ca/arcgis/rest/services/primary/cot_ortho_webm/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
    },
  },
  layers: [],
};
const LAYERS_NON_SYMBOL_AERIAL = [
  {
    id: 'gcc-ortho-webm',
    type: 'raster',
    source: 'gcc-ortho-webm',
    minzoom: MapZoom.LEVEL_3.minzoom,
    maxzoom: MapZoom.LEVEL_1.maxzoomLayer,
    paint: {
      'raster-opacity': 0.8,
    },
  },
];


// MOVE FEATURE LAYERS

function interactionAttr(base, hovered, selected) {
  return [
    'case',
    ['boolean', ['feature-state', 'selected'], false], selected,
    ['boolean', ['feature-state', 'hover'], false], hovered,
    base,
  ];
}

const PAINT_OPACITY = interactionAttr(0.45, 0.6, 0.6);
const PAINT_COLOR_CENTRELINE = interactionAttr(
  '#dcdee0',
  '#e5a000',
  '#00a91c',
);
const PAINT_COLOR_COUNTS = interactionAttr(
  '#00bde3',
  '#e5a000',
  '#00a91c',
);
const PAINT_WIDTH_MIDBLOCKS = interactionAttr(3, 5, 5);
const PAINT_RADIUS_INTERSECTIONS = interactionAttr(8, 10, 10);
const PAINT_RADIUS_COUNTS = interactionAttr(10, 12, 12);

function addTippecanoeSource(style, id, minLevel, maxLevel, crossfade = 0) {
  /* eslint-disable-next-line no-param-reassign */
  style.sources[id] = {
    type: 'vector',
    tiles: [`https://flashcrow-etladmin.intra.dev-toronto.ca/tiles/${id}/{z}/{x}/{y}.pbf`],
    minzoom: minLevel.minzoom,
    maxzoom: maxLevel.maxzoomSource + crossfade,
  };
}

function addDynamicTileSource(style, id, minLevel, maxLevel) {
  const { origin } = window.location;
  /* eslint-disable-next-line no-param-reassign */
  style.sources[id] = {
    type: 'vector',
    tiles: [`${origin}/api/dynamicTiles/${id}/{z}/{x}/{y}.pbf`],
    minzoom: minLevel.minzoom,
    maxzoom: maxLevel.maxzoomSource,
  };
}

function addLayer(style, id, type, options) {
  const source = style.sources[id];
  style.layers.push({
    id,
    source: id,
    'source-layer': id,
    type,
    minzoom: source.minzoom,
    maxzoom: source.maxzoom + 1,
    ...options,
  });
}

function injectSourcesAndLayers(style) {
  addTippecanoeSource(style, 'collisionsLevel3', MapZoom.LEVEL_3, MapZoom.LEVEL_3, 2);
  addTippecanoeSource(style, 'collisionsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'collisionsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'counts', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'intersections', MapZoom.LEVEL_3, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'midblocks', MapZoom.LEVEL_3, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'schoolsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'schoolsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);

  addLayer(style, 'midblocks', 'line', {
    paint: {
      'line-color': PAINT_COLOR_CENTRELINE,
      'line-width': PAINT_WIDTH_MIDBLOCKS,
      'line-opacity': PAINT_OPACITY,
    },
  });
  addLayer(style, 'intersections', 'circle', {
    paint: {
      'circle-color': PAINT_COLOR_CENTRELINE,
      'circle-radius': PAINT_RADIUS_INTERSECTIONS,
      'circle-opacity': PAINT_OPACITY,
    },
  });
  addLayer(style, 'counts', 'circle', {
    paint: {
      'circle-color': PAINT_COLOR_COUNTS,
      'circle-radius': PAINT_RADIUS_COUNTS,
      'circle-opacity': PAINT_OPACITY,
    },
  });
  addLayer(style, 'collisionsLevel3', 'heatmap', {
    paint: {
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(244, 227, 219, 0)',
        0.5, '#f39268',
        1, '#d63e04',
      ],
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        style.sources.collisionsLevel3.minzoom, 1,
        style.sources.collisionsLevel3.maxzoom, 3,
      ],
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        style.sources.collisionsLevel3.maxzoom, 0.8,
        style.sources.collisionsLevel3.maxzoom + 1, 0,
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        style.sources.collisionsLevel3.minzoom, 5,
        style.sources.collisionsLevel3.maxzoom, 10,
      ],
      'heatmap-weight': ['get', 'heatmap_weight'],
    },
  });
  addLayer(style, 'collisionsLevel2', 'circle', {
    layout: {
      'circle-sort-key': ['get', 'injury'],
    },
    paint: {
      'circle-color': [
        'case',
        ['>=', ['get', 'injury'], 3], '#b51d09',
        '#d63e04',
      ],
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        style.sources.collisionsLevel2.minzoom, 0.2,
        style.sources.collisionsLevel2.minzoom + 1, [
          'case',
          ['>=', ['get', 'injury'], 3], 0.8,
          0.6,
        ],
      ],
      'circle-radius': [
        'case',
        ['>=', ['get', 'injury'], 3], 10,
        5,
      ],
    },
  });
  addLayer(style, 'collisionsLevel1', 'circle', {
    layout: {
      'circle-sort-key': ['get', 'injury'],
    },
    paint: {
      'circle-color': [
        'case',
        ['>=', ['get', 'injury'], 3], '#b51d09',
        '#d63e04',
      ],
      'circle-opacity': [
        'case',
        ['>=', ['get', 'injury'], 3], 0.8,
        0.6,
      ],
      'circle-radius': [
        'case',
        ['>=', ['get', 'injury'], 3], 10,
        5,
      ],
    },
  });
  addLayer(style, 'schoolsLevel2', 'symbol', {
    layout: {
      'text-field': [
        'match',
        ['get', 'schoolType'],
        'U', '\uf19d',
        'C', '\uf19d',
        '\uf549',
      ],
      'text-font': ['literal', ['Font Awesome 5 Free']],
      'text-size': 16,
    },
    paint: {
      'text-color': '#00a91c',
    },
  });
  addLayer(style, 'schoolsLevel1', 'symbol', {
    layout: {
      'text-field': [
        'match',
        ['get', 'schoolType'],
        'U', '\uf19d',
        'C', '\uf19d',
        '\uf549',
      ],
      'text-font': ['literal', ['Font Awesome 5 Free']],
      'text-size': 20,
    },
    paint: {
      'text-color': '#00a91c',
    },
  });
  return style;
}

class GeoStyle {
  static getBaseStyle({ aerial, dark }) {
    if (aerial) {
      return STYLE_BASE_AERIAL;
    }
    if (dark) {
      return STYLE_BASE_MAP_DARK;
    }
    return STYLE_BASE_MAP_LIGHT;
  }

  static getNonSymbolLayers({ aerial, dark }) {
    if (aerial) {
      return LAYERS_NON_SYMBOL_AERIAL;
    }
    if (dark) {
      return LAYERS_NON_SYMBOL_MAP_DARK;
    }
    return LAYERS_NON_SYMBOL_MAP_LIGHT;
  }

  static getSymbolLayers({ dark }) {
    if (dark) {
      return LAYERS_SYMBOL_DARK;
    }
    return LAYERS_SYMBOL_LIGHT;
  }

  static get(options) {
    const baseStyle = GeoStyle.getBaseStyle(options);
    const nonSymbolLayers = GeoStyle.getNonSymbolLayers(options);
    const symbolLayers = GeoStyle.getSymbolLayers(options);

    const style = {
      ...baseStyle,
      glyphs: 'https://flashcrow-etladmin.intra.dev-toronto.ca/glyphs/{fontstack}/{range}.pbf',
      layers: [
        ...nonSymbolLayers,
      ],
    };
    injectSourcesAndLayers(style);
    style.layers = style.layers.concat(symbolLayers);

    return style;
  }
}

export default GeoStyle;
