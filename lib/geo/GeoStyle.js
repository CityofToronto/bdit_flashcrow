import { CentrelineType, MapZoom } from '@/lib/Constants';
import rootStyleLight from '@/lib/geo/theme/light/root.json';
import metadataLight from '@/lib/geo/theme/light/metadata.json';
import DateTime from '@/lib/time/DateTime';
import { timeIntervalOverlap } from '@/lib/time/TimeUtils';

const NOW = DateTime.local();

// MAP ASSETS ORIGIN

/**
 * @returns {string} origin for map tiles and glyphs
 */
function getStaticMapAssetsOrigin() {
  if (window.document.domain === 'localhost') {
    return 'https://move.intra.qa-toronto.ca';
  }
  return window.location.origin;
}

const ORIGIN_STATIC_MAP_ASSETS = getStaticMapAssetsOrigin();

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

function normalizeAndSeparateLayers(style) {
  const nonSymbolLayers = [];
  const symbolLayers = [];

  /* eslint-disable-next-line no-param-reassign */
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
     * with icons for points of interest, studies, etc.
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
  /* eslint-disable-next-line no-param-reassign */
  style.sprite = `${origin}/icons/map/sprite`;

  /*
   * Drop layers so that we can dynamically build layer sets based on map options
   * from non-symbol, feature, and symbol layer lists.
   */
  /* eslint-disable-next-line no-param-reassign */
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
  style: STYLE_BASE_MAP_LIGHT,
  nonSymbolLayers: LAYERS_NON_SYMBOL_MAP_LIGHT,
  symbolLayers: LAYERS_SYMBOL_LIGHT,
} = generateBasemapStyle(rootStyleLight, metadataLight);

const STYLE_BASE_AERIAL = {
  version: 8,
  sources: {
    ...STYLE_BASE_MAP_LIGHT.sources,
    'gcc-ortho-webm': {
      type: 'raster',
      tiles: [
        'https://gis.toronto.ca/arcgis/rest/services/basemap/cot_ortho/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
    },
  },
  layers: [],
};
normalizeAndSeparateLayers(STYLE_BASE_AERIAL);

// MOVE SOURCES

function addTippecanoeSource(style, id, minLevel, maxLevel, crossfade = 0, options = {}) {
  /* eslint-disable-next-line no-param-reassign */
  style.sources[id] = {
    type: 'vector',
    tiles: [`${ORIGIN_STATIC_MAP_ASSETS}/tiles/${id}/{z}/{x}/{y}.pbf`],
    minzoom: minLevel.minzoom,
    maxzoom: maxLevel.maxzoomSource + crossfade,
    ...options,
  };
}

function addDynamicTileSource(style, id, minLevel, maxLevel, options = {}) {
  const { origin } = window.location;
  /* eslint-disable-next-line no-param-reassign */
  style.sources[id] = {
    type: 'vector',
    tiles: [`${origin}/api/dynamicTiles/${id}/{z}/{x}/{y}.pbf`],
    minzoom: minLevel.minzoom,
    maxzoom: maxLevel.maxzoomSource,
    ...options,
  };
}

/*
 * Vector sources refer to URLs, and can be reloaded from those URLs when `GeoStyle` map
 * options change.  To achieve the same thing with GeoJSON, we need to maintain a single
 * data reference that is shared between all base styles.
 */
const CACHE_GEOJSON = {};

function addGeoJsonSource(style, id) {
  if (!Object.prototype.hasOwnProperty.call(CACHE_GEOJSON, id)) {
    CACHE_GEOJSON[id] = {
      type: 'FeatureCollection',
      features: [],
    };
  }
  /* eslint-disable-next-line no-param-reassign */
  style.sources[id] = {
    type: 'geojson',
    data: CACHE_GEOJSON[id],
  };
}

function injectSources(style) {
  // SOURCES
  addTippecanoeSource(style, 'collisionsLevel3:10', MapZoom.LEVEL_3, MapZoom.LEVEL_3, 2);
  addTippecanoeSource(style, 'collisionsLevel2:10', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'collisionsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'hospitalsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'hospitalsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'intersections', MapZoom.LEVEL_3, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'midblocks', MapZoom.LEVEL_3, MapZoom.LEVEL_1);
  addTippecanoeSource(style, 'schoolsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(style, 'schoolsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addDynamicTileSource(style, 'studies', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addGeoJsonSource(style, 'locations');
  addGeoJsonSource(style, 'locations-markers');
  addGeoJsonSource(style, 'hover-markers');
}

injectSources(STYLE_BASE_MAP_LIGHT);
injectSources(STYLE_BASE_AERIAL);

// MOVE FEATURE LAYERS

const COLOR_CENTRELINE_GREY = '#9b9b9b';
const COLOR_COLLISION_HEATMAP_ZERO = 'rgba(244, 227, 219, 0)';
const COLOR_COLLISION_HEATMAP_HALF = '#f39268';
const COLOR_COLLISION_FILL = '#ef4848';
const COLOR_COLLISION_STROKE = '#773333';

/*
 * See https://www.figma.com/file/M0Vb8zzGfN6VMw1AYdBrjB/Design-Critique---Showing-Volume-Data?node-id=2%3A996
 * for colours, widths.
 *
 * The widths listed here take our 0.5px border into account.
 */
const COLOR_VOLUME_LOW = '#46e0cc';
const COLOR_VOLUME_MED = '#22ccb5';
const COLOR_VOLUME_HIGH = '#14796c';
const WIDTH_VOLUME_LOW = 3;
const WIDTH_VOLUME_MED = 5;
const WIDTH_VOLUME_HIGH = 8;

/**
 * Produces a "factory function" that can be used to build three-step scales for different
 * classes of road.  This makes it easier to build up complex Mapbox GL style expressions
 * that use class-dependent AADT thresholds.
 *
 * @param {*} lowValue - Mapbox GL style expression, used when `aadt < lowThreshold`
 * @param {*} medValue - Mapbox GL style expression, used when
 * `lowThreshold <= aadt && aadt < highThreshold`
 * @param {*} highValue - MapboxGL style expression, used when `highThreshold <= aadt`
 * @returns {function} function that takes two numbers `(lowThreshold, highThreshold)`
 * and returns a Mapbox GL style expression representing a three-step scale
 */
function aadtScaleFactory(lowValue, medValue, highValue) {
  return (lowThreshold, highThreshold) => [
    'step',
    ['get', 'aadt'],
    lowValue,
    lowThreshold, medValue,
    highThreshold, highValue,
  ];
}

const aadtScaleLineColor = aadtScaleFactory(COLOR_VOLUME_LOW, COLOR_VOLUME_MED, COLOR_VOLUME_HIGH);
const aadtScaleLineWidth = aadtScaleFactory(WIDTH_VOLUME_LOW, WIDTH_VOLUME_MED, WIDTH_VOLUME_HIGH);

/**
 * Produces a Mapbox GL style expression that allows us to vary styles depending on
 * class-dependent AADT thresholds.
 *
 * The specific thresholds used here are from the City of Toronto's Road Classification
 * System, which provides rough AADT benchmarks for different classes of road.  In particular,
 * we use the local road maximum (2500 vehicles per day) as the low volume threshold, and
 * the major arterial road maximum (20000 vehicles per day) as the high volume threshold.
 *
 * @see https://www.toronto.ca/services-payments/streets-parking-transportation/traffic-management/road-classification-system/about-the-road-classification-system/
 * @param {boolean} volume - is the volume layer turned on?
 * @param {*} defaultValue - Mapbox GL style expression representing the default value
 * @param {function} aadtScale - function that takes two numbers `(lowThreshold, highThreshold)`
 * and returns a Mapbox GL style expression representing a three-step scale
 * @returns {*} Mapbox GL style expression that uses three-step scales with class-dependent AADT
 * thresholds
 */
function aadtScaledFeature(volume, defaultValue, aadtScale) {
  if (!volume) {
    return defaultValue;
  }
  return [
    'case',
    ['==', ['get', 'aadt'], null], defaultValue,
    aadtScale(2500, 20000),
  ];
}

// MAIN CLASS

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

/**
 * Helper class to build Mapbox GL styles for use in the MOVE map.  These styles must respond
 * to several pieces of state:
 *
 * - aerial vs. map modes;
 * - toggles for various layers;
 * - the current map zoom level;
 * - user interactions with features.
 */
class GeoStyle {
  static getBaseStyle({ aerial }) {
    if (aerial) {
      return STYLE_BASE_AERIAL;
    }
    return STYLE_BASE_MAP_LIGHT;
  }

  static getNonSymbolLayers({ aerial, layers: { collisions, studies, volume } }) {
    if (aerial) {
      let paint = {};
      if (collisions || studies || volume) {
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
    return LAYERS_NON_SYMBOL_MAP_LIGHT;
  }

  static getCentrelineLayers({ layers: { volume } }, baseStyle) {
    const lineColor = aadtScaledFeature(volume, COLOR_CENTRELINE_GREY, aadtScaleLineColor);
    const lineWidth = aadtScaledFeature(volume, WIDTH_VOLUME_LOW, aadtScaleLineWidth);
    return [
      getLayer(baseStyle, 'midblocks', 'line', {
        layout: {
          'line-cap': 'round',
          'line-sort-key': ['get', 'aadt'],
        },
        paint: {
          'line-color': lineColor,
          'line-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_3.minzoom, 0.6,
            MapZoom.LEVEL_2.minzoom, 1,
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_3.minzoom, 2,
            MapZoom.LEVEL_2.minzoom, lineWidth,
          ],
        },
      }),
      {
        id: 'locations-midblocks',
        source: 'locations',
        filter: ['==', ['get', 'centrelineType'], CentrelineType.SEGMENT],
        type: 'line',
        layout: {
          'line-cap': 'round',
          'line-sort-key': ['get', 'aadt'],
        },
        paint: {
          'line-color': [
            'case',
            ['get', 'deselected'], '#e0e0e0',
            ['get', 'selected'], '#ffffff',
            '#19608c',
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            MapZoom.LEVEL_3.minzoom, 2,
            MapZoom.LEVEL_2.minzoom, lineWidth,
          ],
        },
      },
      {
        id: 'midblocksCasing',
        source: 'midblocks',
        'source-layer': 'midblocks',
        type: 'line',
        minzoom: MapZoom.LEVEL_2.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomSource + 1,
        paint: {
          'line-color': '#ffffff',
          'line-gap-width': lineWidth,
          'line-width': 1,
        },
      },
      {
        id: 'locations-midblocksCasing',
        source: 'locations',
        filter: ['==', ['get', 'centrelineType'], CentrelineType.SEGMENT],
        type: 'line',
        minzoom: MapZoom.LEVEL_2.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomSource + 1,
        paint: {
          'line-color': [
            'case',
            ['get', 'deselected'], '#757575',
            ['get', 'selected'], '#19608c',
            '#ffffff',
          ],
          'line-gap-width': lineWidth,
          'line-width': 1,
        },
      },
      {
        id: 'active-midblocksCasing',
        source: 'midblocks',
        'source-layer': 'midblocks',
        filter: ['in', ['get', 'centrelineId'], ['literal', []]],
        type: 'line',
        minzoom: MapZoom.LEVEL_2.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomSource + 1,
        paint: {
          'line-color': '#272727',
          'line-gap-width': lineWidth,
          'line-width': 2,
        },
      },
      getLayer(baseStyle, 'intersections', 'circle', {
        paint: {
          'circle-color': COLOR_CENTRELINE_GREY,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-radius': 6,
        },
      }),
      {
        id: 'locations-intersections',
        source: 'locations',
        filter: ['==', ['get', 'centrelineType'], CentrelineType.INTERSECTION],
        type: 'circle',
        paint: {
          'circle-color': [
            'case',
            ['get', 'deselected'], '#e0e0e0',
            ['get', 'selected'], '#ffffff',
            '#19608c',
          ],
          'circle-stroke-color': [
            'case',
            ['get', 'deselected'], '#757575',
            ['get', 'selected'], '#19608c',
            '#ffffff',
          ],
          'circle-stroke-width': 1,
          'circle-radius': 6,
        },
      },
      {
        id: 'active-intersections',
        source: 'intersections',
        'source-layer': 'intersections',
        filter: ['in', ['get', 'centrelineId'], ['literal', []]],
        type: 'circle',
        paint: {
          'circle-color': '#54a1e5',
          'circle-opacity': 0,
          'circle-stroke-color': '#404040',
          'circle-stroke-width': 2,
          'circle-radius': 6,
        },
      },
    ];
  }

  static getHospitalsLayers(options, baseStyle) {
    const { layers: { hospitals } } = options;
    const visibility = hospitals ? 'visible' : 'none';
    return [
      getLayer(baseStyle, 'hospitalsLevel2', 'symbol', {
        layout: {
          'icon-allow-overlap': true,
          'icon-image': 'hospital',
          'text-allow-overlap': true,
          visibility,
        },
      }),
      getLayer(baseStyle, 'hospitalsLevel1', 'symbol', {
        layout: {
          'icon-allow-overlap': true,
          'icon-image': 'hospital',
          'text-allow-overlap': true,
          visibility,
        },
      }),
    ];
  }

  static getSchoolsLayers(options, baseStyle) {
    const { layers: { schools } } = options;
    const visibility = schools ? 'visible' : 'none';
    return [
      getLayer(baseStyle, 'schoolsLevel2', 'symbol', {
        layout: {
          'icon-allow-overlap': true,
          'icon-image': 'school',
          'text-allow-overlap': true,
          visibility,
        },
      }),
      getLayer(baseStyle, 'schoolsLevel1', 'symbol', {
        layout: {
          'icon-allow-overlap': true,
          'icon-image': 'school',
          'text-allow-overlap': true,
          visibility,
        },
      }),
    ];
  }

  static getCollisionsFilter({ filtersCollision, filtersCommon }) {
    const {
      dateRangeStart,
      dateRangeEnd,
      daysOfWeek,
    } = filtersCommon;
    const {
      details,
      drivact,
      drivcond,
      emphasisAreas,
      hoursOfDayStart,
      hoursOfDayEnd,
      impactype,
      initdir,
      injury,
      manoeuver,
      mvcr,
      rdsfcond,
      validated,
      vehtype,
    } = filtersCollision;
    const filters = [];
    if (dateRangeStart !== null) {
      filters.push(['>=', ['get', 'accdate'], dateRangeStart.toString()]);
    }
    if (dateRangeEnd !== null) {
      filters.push(['<', ['get', 'accdate'], dateRangeEnd.toString()]);
    }
    if (daysOfWeek.length > 0) {
      filters.push(['in', ['get', 'dayOfWeek'], ['literal', daysOfWeek]]);
    }
    if (details.length > 0) {
      const filtersDetail = details.map(
        detail => ['get', detail.field],
      );
      filters.push(['any', ...filtersDetail]);
    }
    if (drivact.length > 0) {
      const filtersInvolvedField = drivact.map(
        fieldValue => ['in', `|${fieldValue}|`, ['get', 'drivact']],
      );
      filters.push(['any', ...filtersInvolvedField]);
    }
    if (drivcond.length > 0) {
      const filtersInvolvedField = drivcond.map(
        fieldValue => ['in', `|${fieldValue}|`, ['get', 'drivcond']],
      );
      filters.push(['any', ...filtersInvolvedField]);
    }
    if (emphasisAreas.length > 0) {
      const filtersEmphasisAreas = emphasisAreas.map(
        emphasisArea => ['get', emphasisArea.field],
      );
      filters.push(['any', ...filtersEmphasisAreas]);
    }
    if (hoursOfDayStart !== 0) {
      filters.push(['>=', ['get', 'hourOfDay'], hoursOfDayStart]);
    }
    if (hoursOfDayEnd !== 24) {
      filters.push(['<', ['get', 'hourOfDay'], hoursOfDayEnd]);
    }
    if (impactype.length > 0) {
      filters.push(['in', ['get', 'impactype'], ['literal', impactype]]);
    }
    if (initdir.length > 0) {
      const filtersInvolvedField = initdir.map(
        fieldValue => ['in', `|${fieldValue}|`, ['get', 'initdir']],
      );
      filters.push(['any', ...filtersInvolvedField]);
    }
    if (injury.length > 0) {
      filters.push(['in', ['get', 'injury'], ['literal', injury]]);
    }
    if (manoeuver.length > 0) {
      const filtersInvolvedField = manoeuver.map(
        fieldValue => ['in', `|${fieldValue}|`, ['get', 'manoeuver']],
      );
      filters.push(['any', ...filtersInvolvedField]);
    }
    if (mvcr !== null) {
      const op = mvcr ? '==' : '!=';
      filters.push([op, ['get', 'mvaimg'], -1]);
    }
    if (rdsfcond.length > 0) {
      filters.push(['in', ['get', 'rdsfcond'], ['literal', rdsfcond]]);
    }
    if (validated !== null) {
      const op = validated ? '==' : '!=';
      filters.push([op, ['get', 'changed'], -1]);
    }
    if (vehtype.length > 0) {
      const filtersInvolvedField = vehtype.map(
        fieldValue => ['in', `|${fieldValue}|`, ['get', 'vehtype']],
      );
      filters.push(['any', ...filtersInvolvedField]);
    }
    return ['all', ...filters];
  }

  static getCollisionsTimeFactorDateRange(dateRangeStart, dateRangeEnd) {
    const nowMinus10Years = NOW.minus({ years: 10 });
    const start = dateRangeStart === null ? nowMinus10Years : dateRangeStart;
    const end = dateRangeEnd === null ? NOW : dateRangeEnd;
    const a = { start: nowMinus10Years, end: NOW };
    const b = { start, end };
    const overlap = timeIntervalOverlap(a, b);
    if (overlap === null) {
      return 1;
    }
    const { start: startOverlap, end: endOverlap } = overlap;
    const { years } = endOverlap.diff(startOverlap, ['years']).toObject();
    if (years === 0) {
      return 1;
    }
    return years;
  }

  static getCollisionsTimeFactor({ filtersCommon }) {
    const {
      dateRangeStart,
      dateRangeEnd,
    } = filtersCommon;
    return GeoStyle.getCollisionsTimeFactorDateRange(
      dateRangeStart,
      dateRangeEnd,
    );
  }

  static getCollisionsLayers(options) {
    const { layers: { collisions } } = options;
    const sourceLevel3 = 'collisionsLevel3:10';
    const sourceLevel2 = 'collisionsLevel2:10';
    const sourceLevel1 = 'collisionsLevel1';
    const visibility = collisions ? 'visible' : 'none';

    const collisionsFilter = GeoStyle.getCollisionsFilter(options);
    const timeFactor = GeoStyle.getCollisionsTimeFactor(options);
    return [
      {
        id: 'collisionsLevel3',
        source: sourceLevel3,
        'source-layer': sourceLevel3,
        filter: collisionsFilter,
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
            MapZoom.LEVEL_3.minzoom, 1 / timeFactor,
            MapZoom.LEVEL_3.maxzoomSource + 1, 3 / timeFactor,
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
        filter: collisionsFilter,
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
        filter: collisionsFilter,
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

  static getStudiesFilter({ filtersCommon, filtersStudy }) {
    const {
      dateRangeStart,
      dateRangeEnd,
      daysOfWeek,
    } = filtersCommon;
    const {
      hours,
      studyTypes,
    } = filtersStudy;
    const filters = [];
    if (dateRangeStart !== null) {
      filters.push(['>=', ['get', 'startDate'], dateRangeStart.toString()]);
    }
    if (dateRangeEnd !== null) {
      filters.push(['<=', ['get', 'startDate'], dateRangeEnd.toString()]);
    }
    if (daysOfWeek.length > 0) {
      const filtersDaysOfWeek = daysOfWeek.map(
        dayOfWeek => ['in', `|${dayOfWeek}|`, ['get', 'daysOfWeek']],
      );
      filters.push(['any', ...filtersDaysOfWeek]);
    }
    if (hours.length > 0) {
      const valuesHours = hours.map(({ name }) => name);
      filters.push(['in', ['get', 'hours'], ['literal', valuesHours]]);
    }
    if (studyTypes.length > 0) {
      const valuesStudyTypes = studyTypes.map(({ name }) => name);
      filters.push(['in', ['get', 'studyType'], ['literal', valuesStudyTypes]]);
    }
    return ['all', ...filters];
  }

  static getStudiesLayers(options) {
    const { layers: { studies } } = options;
    const source = 'studies';
    const visibility = studies ? 'visible' : 'none';

    const studiesFilter = GeoStyle.getStudiesFilter(options);
    return [
      {
        id: 'studies',
        source,
        'source-layer': source,
        filter: studiesFilter,
        type: 'symbol',
        minzoom: MapZoom.LEVEL_2.minzoom,
        maxzoom: MapZoom.LEVEL_1.maxzoomSource + 1,
        layout: {
          'icon-allow-overlap': true,
          'icon-image': 'study',
          visibility,
        },
      },
    ];
  }

  static getFeatureLayers(options, baseStyle) {
    const centrelineLayers = GeoStyle.getCentrelineLayers(options, baseStyle);
    const collisionsLayers = GeoStyle.getCollisionsLayers(options, baseStyle);
    const hospitalsLayers = GeoStyle.getHospitalsLayers(options, baseStyle);
    const schoolsLayers = GeoStyle.getSchoolsLayers(options, baseStyle);
    const studiesLayers = GeoStyle.getStudiesLayers(options, baseStyle);

    return [
      ...centrelineLayers,
      ...collisionsLayers,
      ...hospitalsLayers,
      ...schoolsLayers,
      ...studiesLayers,
    ];
  }

  static getSymbolLayers() {
    return LAYERS_SYMBOL_LIGHT;
  }

  static getHoverLayers() {
    return [
      {
        id: 'hover-markers',
        source: 'hover-markers',
        type: 'symbol',
        layout: {
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-image': 'location-multi-selected',
          'icon-size': 1.5,
        },
        paint: {
          'text-color': [
            'case',
            ['get', 'deselected'], '#696969',
            ['get', 'selected'], '#19608c',
            '#ffffff',
          ],
        },
      },
    ];
  }

  static getMarkerLayers() {
    return [
      {
        id: 'locations-markers',
        source: 'locations-markers',
        type: 'symbol',
        layout: {
          'icon-allow-overlap': true,
          'icon-anchor': 'bottom',
          'icon-image': [
            'case',
            ['get', 'multi'], [
              'case',
              ['==', ['get', 'locationIndex'], -1], [
                'case',
                ['==', ['get', 'centrelineType'], CentrelineType.SEGMENT], [
                  'case',
                  ['get', 'deselected'], 'location-multi-midblock-deselected',
                  ['get', 'selected'], 'location-multi-midblock-selected',
                  'location-multi-midblock',
                ],
                [
                  'case',
                  ['get', 'deselected'], 'location-multi-intersection-deselected',
                  ['get', 'selected'], 'location-multi-intersection-selected',
                  'location-multi-intersection',
                ],
              ],
              [
                'case',
                ['get', 'deselected'], 'location-multi-deselected',
                ['get', 'selected'], 'location-multi-selected',
                'location-multi',
              ],
            ],
            'location-single',
          ],
          'text-allow-overlap': true,
          'text-field': [
            'case',
            ['get', 'multi'], [
              'case',
              ['==', ['get', 'locationIndex'], -1], '',
              ['to-string', ['+', ['get', 'locationIndex'], 1]],
            ],
            '',
          ],
          'text-font': [
            'Roboto Medium',
          ],
          'text-offset': [0, -1.57],
          'text-size': 14,
        },
        paint: {
          'text-color': [
            'case',
            ['get', 'deselected'], '#696969',
            ['get', 'selected'], '#19608c',
            '#ffffff',
          ],
        },
      },
    ];
  }

  static get(options) {
    const baseStyle = GeoStyle.getBaseStyle(options);
    const nonSymbolLayers = GeoStyle.getNonSymbolLayers(options);
    const featureLayers = GeoStyle.getFeatureLayers(options, baseStyle);
    const symbolLayers = GeoStyle.getSymbolLayers(options);
    const markerLayers = GeoStyle.getMarkerLayers(options);
    const hoverLayers = GeoStyle.getHoverLayers(options);

    const style = {
      ...baseStyle,
      glyphs: `${ORIGIN_STATIC_MAP_ASSETS}/glyphs/{fontstack}/{range}.pbf`,
    };
    style.layers = [
      ...nonSymbolLayers,
      ...featureLayers,
      ...symbolLayers,
      ...markerLayers,
      ...hoverLayers,
    ];

    return style;
  }

  static setData(id, data) {
    CACHE_GEOJSON[id] = data;
  }
}

export default GeoStyle;
