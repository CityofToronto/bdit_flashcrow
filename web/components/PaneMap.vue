<template>
  <div class="pane-map">
    <div
      v-if="loading"
      class="pane-map-loading-spinner">
      <TdsLoadingSpinner />
    </div>
    <div class="pane-map-google-maps">
      <button
        class="font-size-l"
        :disabled="coordinates === null">
        <a :href="hrefGoogleMaps" target="_blank">Google Maps</a>
      </button>
    </div>
    <div class="pane-map-mode">
      <button class="font-size-l" @click="toggleSatellite">
        {{ satellite ? 'Map' : 'Aerial' }}
      </button>
    </div>
    <PaneMapPopup
      v-if="hoveredFeature"
      :feature="hoveredFeature"
      :hover="true"
      @mouseover.native="clearHoveredFeature" />
    <PaneMapPopup
      v-else-if="selectedFeature"
      :feature="selectedFeature"
      :hover="false" />
    <div
      v-if="$route.name !== 'viewData'"
      class="pane-display-toggle flex-container-row font-size-xl"
      :class="{
        'drawer-open': drawerOpen,
      }"
      @click="setDrawerOpen(!drawerOpen)">
      <div class="flex-fill text-center px-s">
        <i
          class="fa"
          :class="{
            'fa-chevron-left': drawerOpen,
            'fa-chevron-right': !drawerOpen,
          }"></i>
      </div>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';

import TdsLoadingSpinner from '@/web/components/tds/TdsLoadingSpinner.vue';
import { CentrelineType } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';
import style from '@/lib/geo/root.json';
import metadata from '@/lib/geo/metadata.json';
import GeoStyle from '@/lib/geo/GeoStyle';
import PaneMapPopup from '@/web/components/PaneMapPopup.vue';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);

const ZOOM_MIN_BASEMAP = 0;
const ZOOM_TORONTO = 10;
const ZOOM_MIN_INTERSECTIONS = 12;
const ZOOM_MIN_COUNTS = 14;
const ZOOM_LOCATION = 17;
const ZOOM_MAX = 19;
const ZOOM_MAX_BASEMAP = 23;

const PAINT_OPACITY = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  // selected
  0.6,
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    0.6,
    // normal
    0.45,
  ],
];

const PAINT_COLOR_CENTRELINE = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  // selected
  '#00a91c',
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    '#e5a000',
    // unhovered
    '#dcdee0',
  ],
];
const PAINT_SIZE_CENTRELINE = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  // selected
  5,
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    5,
    // normal
    3,
  ],
];
const PAINT_SIZE_INTERSECTIONS = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  // selected
  10,
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    10,
    // normal
    8,
  ],
];
const PAINT_COLOR_COUNTS = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  // selected
  '#00a91c',
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    '#e5a000',
    // unhovered
    '#00bde3',
  ],
];

function injectSourcesAndLayers(rawStyle) {
  const STYLE = {};
  Object.assign(STYLE, rawStyle);

  STYLE.glyphs = 'https://move.intra.dev-toronto.ca/glyphs/{fontstack}/{range}.pbf';

  STYLE.sources.centreline = {
    type: 'vector',
    tiles: ['https://move.intra.dev-toronto.ca/tiles/centreline/{z}/{x}/{y}.pbf'],
  };

  STYLE.sources.intersections = {
    type: 'vector',
    tiles: ['https://move.intra.dev-toronto.ca/tiles/intersections/{z}/{x}/{y}.pbf'],
  };

  STYLE.sources['collisions-heatmap'] = {
    type: 'vector',
    tiles: ['https://move.intra.dev-toronto.ca/tiles/collisions/{z}/{x}/{y}.pbf'],
  };

  const { origin } = window.location;

  STYLE.sources.collisions = {
    type: 'vector',
    tiles: [`${origin}/api/dynamicTiles/collisions/{z}/{x}/{y}.pbf`],
  };

  STYLE.sources.counts = {
    type: 'vector',
    tiles: [`${origin}/api/dynamicTiles/counts/{z}/{x}/{y}.pbf`],
  };

  STYLE.sources.schools = {
    type: 'vector',
    tiles: [`${origin}/api/dynamicTiles/schools/{z}/{x}/{y}.pbf`],
  };

  STYLE.layers.push({
    id: 'centreline',
    source: 'centreline',
    'source-layer': 'centreline',
    type: 'line',
    minzoom: ZOOM_TORONTO,
    maxzoom: ZOOM_MAX + 1,
    paint: {
      'line-color': PAINT_COLOR_CENTRELINE,
      'line-width': PAINT_SIZE_CENTRELINE,
      'line-opacity': PAINT_OPACITY,
    },
  });

  STYLE.layers.push({
    id: 'intersections',
    source: 'intersections',
    'source-layer': 'centreline_intersection',
    type: 'circle',
    minzoom: ZOOM_MIN_INTERSECTIONS,
    maxzoom: ZOOM_MAX + 1,
    paint: {
      'circle-color': PAINT_COLOR_CENTRELINE,
      'circle-radius': PAINT_SIZE_INTERSECTIONS,
      'circle-opacity': PAINT_OPACITY,
    },
  });

  STYLE.layers.push({
    id: 'counts',
    source: 'counts',
    'source-layer': 'counts',
    type: 'circle',
    minzoom: ZOOM_MIN_COUNTS,
    maxzoom: ZOOM_MAX + 1,
    paint: {
      'circle-color': PAINT_COLOR_COUNTS,
      'circle-radius': 10,
      'circle-opacity': PAINT_OPACITY,
    },
  });

  STYLE.layers.push({
    id: 'collisions-heatmap',
    source: 'collisions-heatmap',
    'source-layer': 'collisions',
    type: 'heatmap',
    minzoom: ZOOM_TORONTO,
    maxzoom: ZOOM_MIN_COUNTS + 1,
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
        ZOOM_TORONTO, 1,
        ZOOM_MIN_COUNTS, 3,
      ],
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        ZOOM_MIN_COUNTS, 0.8,
        ZOOM_MIN_COUNTS + 1, 0,
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        ZOOM_TORONTO, 5,
        ZOOM_MIN_COUNTS, 10,
      ],
      'heatmap-weight': ['get', 'heatmap_weight'],
    },
  });

  STYLE.layers.push({
    id: 'collisions-non-ksi',
    source: 'collisions',
    'source-layer': 'collisions',
    filter: ['<', ['get', 'injury'], 3],
    type: 'circle',
    minzoom: ZOOM_MIN_COUNTS,
    maxzoom: ZOOM_MAX + 1,
    paint: {
      'circle-color': '#d63e04',
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        ZOOM_MIN_COUNTS, 0.2,
        ZOOM_MIN_COUNTS + 1, 0.6,
      ],
      'circle-radius': 5,
    },
  });

  STYLE.layers.push({
    id: 'collisions-ksi',
    source: 'collisions',
    'source-layer': 'collisions',
    filter: ['>=', ['get', 'injury'], 3],
    type: 'circle',
    minzoom: ZOOM_MIN_COUNTS,
    maxzoom: ZOOM_MAX + 1,
    paint: {
      'circle-color': '#b51d09',
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        ZOOM_MIN_COUNTS, 0.2,
        ZOOM_MIN_COUNTS + 1, 0.8,
      ],
      'circle-radius': 10,
    },
  });

  STYLE.layers.push({
    id: 'schools',
    source: 'schools',
    'source-layer': 'schools',
    type: 'symbol',
    minzoom: ZOOM_MIN_COUNTS,
    maxzoom: ZOOM_MAX + 1,
    layout: {
      'text-field': '\uf549',
      'text-font': ['literal', ['Font Awesome 5 Free']],
      'text-size': [
        'step',
        ['zoom'],
        16,
        ZOOM_LOCATION, 20,
      ],
    },
    paint: {
      'text-color': '#00a91c',
    },
  });

  return STYLE;
}

export default {
  name: 'PaneMap',
  components: {
    TdsLoadingSpinner,
    PaneMapPopup,
  },
  provide() {
    const self = this;
    return {
      get map() {
        return self.map;
      },
    };
  },
  data() {
    return {
      coordinates: null,
      loading: false,
      satellite: false,
      // keeps track of which feature we are currently hovering over
      hoveredFeature: null,
      // keeps track of currently selected feature
      selectedFeature: null,
    };
  },
  computed: {
    hrefGoogleMaps() {
      if (this.coordinates === null) {
        return '#';
      }
      const { lat, lng, zoom } = this.coordinates;
      const z = Math.round(zoom);
      return `https://www.google.com/maps/@${lat},${lng},${z}z`;
    },
    selectedFeatureNeedsUpdate() {
      if (this.location === null) {
        return this.selectedFeature !== null;
      }
      if (this.selectedFeature === null) {
        return true;
      }
      const { centrelineId, centrelineType } = this.location;
      const layerId = this.selectedFeature.layer.id;
      if (centrelineType === CentrelineType.SEGMENT) {
        if (layerId === 'centreline') {
          return this.selectedFeature.properties.geo_id !== centrelineId;
        }
        return true;
      }
      if (centrelineType === CentrelineType.INTERSECTION) {
        if (layerId === 'counts') {
          return this.selectedFeature.properties.centrelineId !== centrelineId;
        }
        if (layerId === 'intersections') {
          return this.selectedFeature.properties.int_id !== centrelineId;
        }
        return true;
      }
      return false;
    },
    ...mapState(['drawerOpen', 'location']),
  },
  created() {
    this.map = null;
  },
  mounted() {
    const bounds = BOUNDS_TORONTO;
    const mapStyle = new GeoStyle(style, metadata).get();
    this.mapStyle = injectSourcesAndLayers(mapStyle);
    this.satelliteStyle = injectSourcesAndLayers({
      version: 8,
      sources: {
        'gcc-ortho-webm': {
          type: 'raster',
          tiles: [
            'https://gis.toronto.ca/arcgis/rest/services/primary/cot_ortho_webm/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'gcc-ortho-webm',
          type: 'raster',
          source: 'gcc-ortho-webm',
          minzoom: ZOOM_MIN_BASEMAP,
          maxzoom: ZOOM_MAX_BASEMAP,
        },
      ],
    });

    // marker
    this.selectedMarker = new mapboxgl.Marker()
      .setLngLat(BOUNDS_TORONTO.getCenter());

    Vue.nextTick(() => {
      this.loading = false;
      this.map = new mapboxgl.Map({
        bounds,
        boxZoom: false,
        container: this.$el,
        dragRotate: false,
        maxBounds: bounds,
        minZoom: ZOOM_TORONTO,
        maxZoom: ZOOM_MAX,
        pitchWithRotate: false,
        renderWorldCopies: false,
        style: this.mapStyle,
        zoom: ZOOM_TORONTO,
      });
      this.updateCoordinates();
      this.map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right',
      );
      this.easeToLocation(this.location, null);
      this.map.on('load', () => {
        this.map.on('move', this.onMapMove.bind(this));
        this.map.on('click', this.onMapClick.bind(this));
        this.map.on('mousemove', this.onMapMousemove.bind(this));
      });
      this.map.on('dataloading', () => {
        this.loading = true;
      });
      this.map.on('idle', () => {
        this.updateSelectedFeature();
        this.loading = false;
      });
    });
  },
  beforeDestroy() {
    /*
     * If the user navigates to a page that doesn't include `PaneMap` between `created()`
     * and `mounted()`, it can happen that `this.map === null`.
     */
    if (this.map !== null) {
      this.map.remove();
    }
  },
  watch: {
    drawerOpen() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
    location(location, oldLocation) {
      this.easeToLocation(location, oldLocation);
      this.updateSelectedMarker();
    },
    $route() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
  },
  methods: {
    clearHoveredFeature() {
      if (this.hoveredFeature !== null) {
        this.map.setFeatureState(this.hoveredFeature, { hover: false });
        this.hoveredFeature = null;
      }
    },
    setHoveredFeature(feature) {
      this.clearHoveredFeature();
      if (feature !== null) {
        this.map.setFeatureState(feature, { hover: true });
        this.hoveredFeature = feature;
      }
    },
    clearSelectedFeature() {
      if (this.selectedFeature !== null) {
        this.map.setFeatureState(this.selectedFeature, { selected: false });
        this.selectedFeature = null;
      }
    },
    setSelectedFeature(feature) {
      this.clearSelectedFeature();
      if (feature !== null) {
        this.map.setFeatureState(feature, { selected: true });
        this.selectedFeature = feature;
        this.clearHoveredFeature();
      }
    },
    easeToLocation(location, oldLocation) {
      if (location !== null) {
        // zoom to location
        const { lat, lng } = location;
        const center = new mapboxgl.LngLat(lng, lat);
        const zoom = Math.max(this.map.getZoom(), ZOOM_LOCATION);
        this.map.easeTo({
          center,
          zoom,
        });
      } else if (oldLocation === null) {
        /*
         * If the user is first loading the map, we want to show all of Toronto.
         * Otherwise, the user has just cleared the location, and we want to keep
         * them in the same place to avoid confusion.
         */
        const center = BOUNDS_TORONTO.getCenter();
        this.map.easeTo({
          center,
          zoom: ZOOM_TORONTO,
        });
      }
    },
    getFeatureForLayerAndProperty(layer, key, value) {
      const features = this.map.queryRenderedFeatures({
        layers: [layer],
        filter: ['==', ['get', key], value],
      });
      if (features.length === 0) {
        return null;
      }
      return features[0];
    },
    /**
     * Fetches the vector tile feature for the given location, as stored in the Vuex store.
     *
     * @param {Object?} location - location to get feature for, or `null`
     * @returns {Object?} the matched feature, or `null` if no such feature
     */
    getFeatureForLocation(location) {
      if (location === null) {
        return null;
      }
      const { centrelineId, centrelineType } = location;
      if (centrelineType === CentrelineType.SEGMENT) {
        return this.getFeatureForLayerAndProperty(
          'centreline',
          'geo_id',
          centrelineId,
        );
      }
      if (centrelineType === CentrelineType.INTERSECTION) {
        let feature = this.getFeatureForLayerAndProperty(
          'counts',
          'centrelineId',
          centrelineId,
        );
        if (feature === null) {
          feature = this.getFeatureForLayerAndProperty(
            'intersections',
            'int_id',
            centrelineId,
          );
        }
        return feature;
      }
      return null;
    },
    /**
     * Fetches the vector tile feature for the given mouse location, usually from a mouse
     * event on the map.
     *
     * For usability, this matching is somewhat fuzzy: it will find the highest-priority
     * feature within a 20x20 bounding box centered on `point`.  Layers in descending
     * priority order:
     *
     * - intersections
     * - counts
     * - centreline
     *
     * TODO: within layers, rank by closest to `point`
     * TODO: don't depend on rendering order of layers
     *
     * @param {Object} point - `(x, y)` coordinates of mouse
     * @returns {Object?} the matched feature, or `null` if no such feature
     */
    getFeatureForPoint(point) {
      const layers = [
        'centreline',
        'counts',
        'intersections',
      ];
      let features = this.map.queryRenderedFeatures(point, { layers });
      if (features.length > 0) {
        // see if a feature was clicked ... if so choose that one
        // if a feature was not clicked then get features in a bounding box
        return features[0];
      }
      const { x, y } = point;
      const bbox = [[x - 10, y - 10], [x + 10, y + 10]];
      features = this.map.queryRenderedFeatures(bbox, { layers });
      if (features.length === 0) {
        return null;
      }

      // get all elements in the bounding box that are intersections
      let feature = features.find(value => value.layer.id === 'intersections');

      // select first centreline segment if there are no intersections in the bounding box
      if (feature === undefined) {
        [feature] = features;
      }
      return feature;
    },
    onCentrelineClick(feature) {
      const { coordinates } = feature.geometry;
      const [lng, lat] = getLineStringMidpoint(coordinates);
      const elementInfo = {
        centrelineId: feature.properties.geo_id,
        centrelineType: CentrelineType.SEGMENT,
        description: feature.properties.lf_name,
        featureCode: feature.properties.fcode,
        lng,
        lat,
      };
      this.setLocation(elementInfo);
    },
    onCountsClick(feature) {
      const [lng, lat] = feature.geometry.coordinates;
      const { centrelineId, centrelineType, numArteryCodes } = feature.properties;
      let description;
      if (numArteryCodes === 1) {
        description = '1 count station';
      }
      description = `${numArteryCodes} count stations`;
      const elementInfo = {
        centrelineId,
        centrelineType,
        description,
        /*
         * The backend doesn't provide these feature codes, so we have to fetch it from
         * the visible layer.
         */
        featureCode: null,
        lat,
        lng,
      };
      // get feature code from the visible layer, if possible
      const locationFeature = this.getFeatureForLocation({ centrelineId, centrelineType });
      if (locationFeature !== null) {
        if (centrelineType === CentrelineType.SEGMENT) {
          const {
            fcode: featureCode,
            lf_name: descriptionVisible,
          } = locationFeature.properties;
          elementInfo.description = descriptionVisible;
          elementInfo.featureCode = featureCode;
        } else if (centrelineType === CentrelineType.INTERSECTION) {
          const {
            intersec5: descriptionVisible,
            elevatio9: featureCode,
          } = locationFeature.properties;
          elementInfo.description = descriptionVisible;
          elementInfo.featureCode = featureCode;
        }
      }
      this.setLocation(elementInfo);
    },
    onIntersectionsClick(feature) {
      // update location
      const [lng, lat] = feature.geometry.coordinates;
      const elementInfo = {
        centrelineId: feature.properties.int_id,
        centrelineType: CentrelineType.INTERSECTION,
        description: feature.properties.intersec5,
        featureCode: feature.properties.elevatio9,
        lat,
        lng,
      };
      this.setLocation(elementInfo);
    },
    onMapClick(e) {
      const feature = this.getFeatureForPoint(e.point);
      this.setSelectedFeature(feature);
      if (feature === null) {
        return;
      }
      const layerId = feature.layer.id;
      if (layerId === 'centreline') {
        this.onCentrelineClick(feature);
      } else if (layerId === 'counts') {
        this.onCountsClick(feature);
      } else if (layerId === 'intersections') {
        this.onIntersectionsClick(feature);
      }
    },
    onMapMousemove(e) {
      const feature = this.getFeatureForPoint(e.point);
      this.setHoveredFeature(feature);
    },
    onMapMove: debounce(function onMapMove() {
      this.updateCoordinates();
    }, 250),
    toggleSatellite() {
      this.satellite = !this.satellite;
      if (this.satellite) {
        this.map.setStyle(this.satelliteStyle, { diff: false });
      } else {
        this.map.setStyle(this.mapStyle, { diff: false });
      }
    },
    updateCoordinates() {
      const { lat, lng } = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.coordinates = { lat, lng, zoom };
    },
    updateSelectedFeature() {
      if (!this.selectedFeatureNeedsUpdate) {
        return;
      }
      const feature = this.getFeatureForLocation(this.location);
      this.setSelectedFeature(feature);
    },
    updateSelectedMarker() {
      if (this.location === null) {
        this.clearSelectedFeature();
        this.selectedMarker.remove();
      } else {
        const { lng, lat } = this.location;
        this.selectedMarker
          .setLngLat([lng, lat])
          .addTo(this.map);
      }
    },
    ...mapMutations(['setDrawerOpen', 'setLocation']),
  },
};
</script>

<style lang="postcss">
.pane-map {
  background-color: var(--white);
  & > .pane-map-loading-spinner {
    background-color: var(--white);
    border: var(--border-default);
    border-radius: var(--space-m);
    height: calc(var(--space-xl) + var(--space-s) * 2);
    padding: var(--space-s);
    position: absolute;
    right: var(--space-l);
    top: var(--space-m);
    width: calc(var(--space-xl) + var(--space-s) * 2);
    z-index: var(--z-index-controls);
  }
  & > .pane-map-google-maps {
    bottom: var(--space-m);
    position: absolute;
    left: var(--space-l);
    z-index: var(--z-index-controls);
  }
  & > .pane-map-mode {
    bottom: var(--space-m);
    position: absolute;
    right: var(--space-l);
    z-index: var(--z-index-controls);
  }
  & > .pane-display-toggle {
    align-items: center;
    background-color: var(--base-lightest);
    border: var(--border-default);
    border-left: none;
    border-radius: 0 var(--space-s) var(--space-s) 0;
    box-shadow: var(--shadow-2);
    color: var(--ink);
    cursor: pointer;
    height: calc(var(--space-xl) * 1.5);
    left: 0;
    position: absolute;
    top: calc(50% - var(--space-l) * 1.5);
    z-index: var(--z-index-controls);

    &:hover {
      background-color: var(--base-lighter);
    }
  }
  .mapboxgl-ctrl-bottom-right {
    bottom: 38px;
    right: 6px;
  }
}
</style>
