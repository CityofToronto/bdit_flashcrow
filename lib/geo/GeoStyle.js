import { MapZoom, RoadSegmentType } from '@/lib/Constants';
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

/* eslint-disable no-param-reassign */
function normalizeAndSeparateLayers(style) {
  const nonSymbolLayers = [];
  const symbolLayers = [];

  style.layers.forEach((layer) => {
    const { layout = {}, paint = {}, type } = layer;
    const {
      'icon-image': iconImage = null,
      'text-field': textField = null,
    } = layout;
    const {
      'fill-pattern': fillPattern = null,
    } = paint;

    /*
     * Drop layers that depend on the ESRI spritemap, as we're using our own spritemap
     * with icons for points of interest, counts, etc.
     */
    if (iconImage !== null || fillPattern !== null) {
      return;
    }

    if (type === 'symbol' && textField !== null) {
      symbolLayers.push(layer);
    } else {
      nonSymbolLayers.push(layer);
    }
  });

  /*
   * Make symbol layers more readable by increasing font size, contrast, and
   * halo sharpness.  We also switch over to Roboto for consistency with other
   * parts of the application.
   */
  symbolLayers.forEach((layer) => {
    const { layout, paint } = layer;

    layout['text-font'] = mapTextFont(layout['text-font']);
    layout['text-size'] = mapTextSize(layout['text-size']);

    paint['text-color'] = '#272727';
    paint['text-halo-blur'] = 0;
    paint['text-halo-color'] = '#ffffff';
    paint['text-halo-width'] = 2;
  });

  /*
   * Load our own spritemap, as described above.  See
   * https://docs.mapbox.com/mapbox-gl-js/style-spec/sprite/ for details on how
   * Mapbox GL spritemaps are structured.
   */
  const { origin } = window.location;
  style.sprite = `${origin}/icons/map/sprite`;

  /*
   * Drop layers so that we can dynamically build layer sets based on map options
   * from non-symbol, feature, and symbol layer lists.
   */
  style.layers = [];

  return [nonSymbolLayers, symbolLayers];
}

function generateBasemapStyle(root, metadata) {
  const style = mergeRootAndMetadata(root, metadata);
  const [nonSymbolLayers, symbolLayers] = normalizeAndSeparateLayers(style);
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
] = normalizeAndSeparateLayers(STYLE_BASE_MAP_LIGHT);

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
normalizeAndSeparateLayers(STYLE_BASE_AERIAL);

// MOVE SOURCES

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

function injectSources(style) {
  // SOURCES
  addTippecanoeSource(style, 'collisionsLevel3:1', MapZoom.LEVEL_3, MapZoom.LEVEL_3, 2);
  addTippecanoeSource(style, 'collisionsLevel3:3', MapZoom.LEVEL_3, MapZoom.LEVEL_3, 2);
  addTippecanoeSource(style, 'collisionsLevel3:5', MapZoom.LEVEL_3, MapZoom.LEVEL_3, 2);
  addTippecanoeSource(style, 'collisionsLevel3:10', MapZoom.LEVEL_3, MapZoom.LEVEL_3, 2);
  addTippecanoeSource(style, 'collisionsLevel2:1', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addTippecanoeSource(style, 'collisionsLevel2:3', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addTippecanoeSource(style, 'collisionsLevel2:5', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addTippecanoeSource(style, 'collisionsLevel2:10', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'collisionsLevel1:1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'collisionsLevel1:3', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'collisionsLevel1:5', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'collisionsLevel1:10', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'counts:1', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'counts:3', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'counts:5', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'counts:10', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'hospitalsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'hospitalsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'intersections', MapZoom.LEVEL_3, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'midblocks', MapZoom.LEVEL_3, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'schoolsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'schoolsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
}

injectSources(STYLE_BASE_MAP_DARK);
injectSources(STYLE_BASE_MAP_LIGHT);
injectSources(STYLE_BASE_AERIAL);

// MOVE FEATURE LAYERS

const COLOR_CENTRELINE_GREY = '#acacac';
const COLOR_COLLISION_HEATMAP_ZERO = 'rgba(244, 227, 219, 0)';
const COLOR_COLLISION_HEATMAP_HALF = '#f39268';
const COLOR_COLLISION_FILL = '#ef4848';
const COLOR_COLLISION_STROKE = '#773333';
const COLOR_VOLUME_GREEN = '#26de81';
const COLOR_VOLUME_YELLOW = '#fed330';
const COLOR_VOLUME_RED = '#fc5c65';

function interactionAttr(base, hovered, selected) {
  return [
    'case',
    ['boolean', ['feature-state', 'selected'], false], selected,
    ['boolean', ['feature-state', 'hover'], false], hovered,
    base,
  ];
}

function aadtScaleLineColor(green, red) {
  return [
    'step',
    ['get', 'aadt'],
    COLOR_VOLUME_GREEN,
    green, COLOR_VOLUME_YELLOW,
    red, COLOR_VOLUME_RED,
  ];
}

function aadtScaledFeature(volume, defaultValue, aadtScale) {
  if (!volume) {
    return defaultValue;
  }
  return [
    'case',
    ['==', ['get', 'aadt'], null], defaultValue,
    [
      'match',
      ['get', 'featureCode'],
      [
        RoadSegmentType.LOCAL.featureCode,
        RoadSegmentType.OTHER.featureCode,
        RoadSegmentType.OTHER_RAMP.featureCode,
        RoadSegmentType.LANEWAY.featureCode,
      ], aadtScale(1500, 2500),
      [
        RoadSegmentType.COLLECTOR.featureCode,
        RoadSegmentType.COLLECTOR_RAMP.featureCode,
      ], aadtScale(6000, 10000),
      [
        RoadSegmentType.MINOR_ARTERIAL.featureCode,
        RoadSegmentType.MINOR_ARTERIAL_RAMP.featureCode,
      ], aadtScale(12000, 20000),
      [
        RoadSegmentType.MAJOR_ARTERIAL.featureCode,
        RoadSegmentType.MAJOR_ARTERIAL_RAMP.featureCode,
      ], aadtScale(24000, 40000),
      [
        RoadSegmentType.EXPRESSWAY.featureCode,
        RoadSegmentType.EXPRESSWAY_RAMP.featureCode,
      ], aadtScale(48000, 80000),
      defaultValue,
    ],
  ];
}

function getLayer(style, id, type, options) {
  const source = style.sources[id];
  return {
    id,
    source: id,
    'source-layer': id,
    type,
    minzoom: source.minzoom,
    maxzoom: source.maxzoom + 1,
    ...options,
  };
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

  static getNonSymbolLayers({ aerial, dark, layers: { collisions, counts, volume } }) {
    if (aerial) {
      let paint = {};
      if (collisions || counts || volume) {
        paint = {
          'raster-brightness-min': 0.2,
          'raster-opacity': 0.8,
          'raster-saturation': -0.2,
        };
      }
      return [{
        id: 'gcc-ortho-webm',
        type: 'raster',
        source: 'gcc-ortho-webm',
        minzoom: MapZoom.LEVEL_3.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomLayer,
        paint,
      }];
    }
    if (dark) {
      return LAYERS_NON_SYMBOL_MAP_DARK;
    }
    return LAYERS_NON_SYMBOL_MAP_LIGHT;
  }

  static getCentrelineLayers({ layers: { volume } }, baseStyle) {
    const lineColor = aadtScaledFeature(volume, COLOR_CENTRELINE_GREY, aadtScaleLineColor);
    return [
      getLayer(baseStyle, 'midblocks', 'line', {
        layout: {
          'line-sort-key': ['get', 'aadt'],
        },
        paint: {
          'line-color': lineColor,
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_3.minzoom, 0.5,
            MapZoom.LEVEL_2.minzoom, 1,
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_3.minzoom, 2,
            MapZoom.LEVEL_2.minzoom, 4,
          ],
        },
      }),
      {
        id: 'midblocksCasing',
        source: 'midblocks',
        'source-layer': 'midblocks',
        type: 'line',
        minzoom: MapZoom.LEVEL_2.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomSource + 1,
        paint: {
          'line-color': interactionAttr('#ffffff', '#757575', '#757575'),
          'line-gap-width': 4,
          'line-width': 1,
        },
      },
      getLayer(baseStyle, 'intersections', 'circle', {
        paint: {
          'circle-color': COLOR_CENTRELINE_GREY,
          'circle-stroke-color': interactionAttr('#ffffff', '#757575', '#757575'),
          'circle-stroke-width': 1,
          'circle-radius': 5,
        },
      }),
    ];
  }

  static getPoiLayers(options, baseStyle) {
    return [
      getLayer(baseStyle, 'hospitalsLevel2', 'symbol', {
        layout: {
          'icon-image': 'hospital',
        },
      }),
      getLayer(baseStyle, 'hospitalsLevel1', 'symbol', {
        layout: {
          'icon-image': 'hospital',
        },
      }),
      getLayer(baseStyle, 'schoolsLevel2', 'symbol', {
        layout: {
          'icon-image': 'school',
        },
      }),
      getLayer(baseStyle, 'schoolsLevel1', 'symbol', {
        layout: {
          'icon-image': 'school',
        },
      }),
    ];
  }

  static getCollisionsLayers({ datesFrom, layers: { collisions } }) {
    const sourceLevel3 = `collisionsLevel3:${datesFrom}`;
    const sourceLevel2 = `collisionsLevel2:${datesFrom}`;
    const sourceLevel1 = `collisionsLevel1:${datesFrom}`;
    const visibility = collisions ? 'visible' : 'none';
    return [
      {
        id: 'collisionsLevel3',
        source: sourceLevel3,
        'source-layer': sourceLevel3,
        type: 'heatmap',
        minzoom: MapZoom.LEVEL_3.minzoom,
        maxzoom: MapZoom.LEVEL_3.maxzoomSource + 3,
        layout: {
          visibility,
        },
        paint: {
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, COLOR_COLLISION_HEATMAP_ZERO,
            0.5, COLOR_COLLISION_HEATMAP_HALF,
            1, COLOR_COLLISION_FILL,
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_3.minzoom, 1 / datesFrom,
            MapZoom.LEVEL_3.maxzoomSource + 1, 3 / datesFrom,
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_2.minzoom, 0.8,
            MapZoom.LEVEL_2.minzoom + 1, 0,
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_3.minzoom, 5,
            MapZoom.LEVEL_3.maxzoomSource + 1, 10,
          ],
          'heatmap-weight': ['get', 'heatmap_weight'],
        },
      }, {
        id: 'collisionsLevel2',
        source: sourceLevel2,
        'source-layer': sourceLevel2,
        type: 'circle',
        minzoom: MapZoom.LEVEL_2.minzoom,
        maxzoom: MapZoom.LEVEL_2.maxzoomSource + 1,
        layout: {
          'circle-sort-key': ['get', 'injury'],
          visibility,
        },
        paint: {
          'circle-color': COLOR_COLLISION_FILL,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_2.minzoom, 0.2,
            MapZoom.LEVEL_2.minzoom + 1, 1,
          ],
          'circle-radius': [
            'case',
            ['>=', ['get', 'injury'], 3], 4.5,
            6.5,
          ],
          'circle-stroke-color': COLOR_COLLISION_STROKE,
          'circle-stroke-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_2.minzoom, 0.2,
            MapZoom.LEVEL_2.minzoom + 1, 1,
          ],
          'circle-stroke-width': [
            'case',
            ['>=', ['get', 'injury'], 3], 3,
            1,
          ],
        },
      }, {
        id: 'collisionsLevel1',
        source: sourceLevel1,
        'source-layer': sourceLevel1,
        type: 'circle',
        minzoom: MapZoom.LEVEL_1.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomSource + 1,
        layout: {
          'circle-sort-key': ['get', 'injury'],
          visibility,
        },
        paint: {
          'circle-color': COLOR_COLLISION_FILL,
          'circle-radius': [
            'case',
            ['>=', ['get', 'injury'], 3], 4.5,
            6.5,
          ],
          'circle-stroke-color': COLOR_COLLISION_STROKE,
          'circle-stroke-width': [
            'case',
            ['>=', ['get', 'injury'], 3], 3,
            1,
          ],
        },
      },
    ];
  }

  static getCountsLayers({ datesFrom, layers: { counts } }) {
    const source = `counts:${datesFrom}`;
    const visibility = counts ? 'visible' : 'none';
    return [
      {
        id: 'counts',
        source,
        'source-layer': source,
        type: 'symbol',
        minzoom: MapZoom.LEVEL_2.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomSource + 1,
        layout: {
          'icon-image': 'count',
          'text-field': [
            'case',
            ['>', ['get', 'numArteryCodes'], 1], ['to-string', ['get', 'numArteryCodes']],
            '',
          ],
          'text-font': [
            'Roboto Medium',
          ],
          'text-offset': [0, 0.12],
          'text-size': 14,
          visibility,
        },
        paint: {
          'text-color': '#ffffff',
        },
      },
    ];
  }

  static getFeatureLayers(options, baseStyle) {
    const centrelineLayers = GeoStyle.getCentrelineLayers(options, baseStyle);
    const collisionsLayers = GeoStyle.getCollisionsLayers(options, baseStyle);
    const poiLayers = GeoStyle.getPoiLayers(options, baseStyle);
    const countsLayers = GeoStyle.getCountsLayers(options, baseStyle);

    return [
      ...centrelineLayers,
      ...collisionsLayers,
      ...poiLayers,
      ...countsLayers,
    ];
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
    const featureLayers = GeoStyle.getFeatureLayers(options, baseStyle);
    const symbolLayers = GeoStyle.getSymbolLayers(options);

    const style = {
      ...baseStyle,
      glyphs: 'https://flashcrow-etladmin.intra.dev-toronto.ca/glyphs/{fontstack}/{range}.pbf',
    };
    style.layers = [
      ...nonSymbolLayers,
      ...featureLayers,
      ...symbolLayers,
    ];

    return style;
  }
}

export default GeoStyle;
