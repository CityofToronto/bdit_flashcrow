<template>
  <div
    class="fill-height pane-map"
    @mouseleave="clearHoveredFeature">
    <div class="pane-map-progress">
      <v-progress-linear
        :active="loading"
        indeterminate />
    </div>
    <FcSearchBarLocation
      v-if="!drawerOpen" />
    <div class="pane-map-mode">
      <FcButton
        class="mr-2"
        type="fab-text"
        @click="openGoogleMaps">
        Street View
      </FcButton>
      <FcButton
        type="fab-text"
        @click="toggleSatellite">
        {{ satellite ? 'Map' : 'Aerial' }}
      </FcButton>
    </div>
    <FcPaneMapPopup
      v-if="hoveredFeature
        && featureKeyHovered !== featureKeySelected
        && featureKeyHovered === featureKeyHoveredPopup"
      :key="'h:' + featureKeyHovered"
      :feature="hoveredFeature"
      :hovered="true" />
    <FcPaneMapPopup
      v-if="!drawerOpen && selectedFeature"
      :key="'s:' + featureKeySelected"
      :feature="selectedFeature"
      :hovered="false" />
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';

import { Enum } from '@/lib/ClassUtils';
import { CentrelineType } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import rootStyleDark from '@/lib/geo/theme/dark/root.json';
import metadataDark from '@/lib/geo/theme/dark/metadata.json';
import GeoStyle from '@/lib/geo/GeoStyle';
import FcPaneMapPopup from '@/web/components/FcPaneMapPopup.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSearchBarLocation from '@/web/components/inputs/FcSearchBarLocation.vue';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);

class MapZoom extends Enum {
  get maxzoomSource() {
    return this.maxzoomLayer - 1;
  }
}
MapZoom.init({
  LEVEL_3: {
    minzoom: 10,
    maxzoomLayer: 14,
  },
  LEVEL_2: {
    minzoom: 14,
    maxzoomLayer: 17,
  },
  LEVEL_1: {
    minzoom: 17,
    maxzoomLayer: 20,
  },
});
MapZoom.MIN = MapZoom.LEVEL_3.minzoom;
MapZoom.MAX = MapZoom.LEVEL_1.maxzoomSource;

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

function injectSourcesAndLayers(rawStyle) {
  const STYLE = { ...rawStyle };

  STYLE.glyphs = 'https://flashcrow-etladmin.intra.dev-toronto.ca/glyphs/{fontstack}/{range}.pbf';

  addTippecanoeSource(STYLE, 'collisionsLevel3', MapZoom.LEVEL_3, MapZoom.LEVEL_3, 2);
  addTippecanoeSource(STYLE, 'collisionsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(STYLE, 'collisionsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);
  addDynamicTileSource(STYLE, 'counts', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addTippecanoeSource(STYLE, 'intersections', MapZoom.LEVEL_2, MapZoom.LEVEL_1);
  addTippecanoeSource(STYLE, 'midblocks', MapZoom.LEVEL_3, MapZoom.LEVEL_1);
  addTippecanoeSource(STYLE, 'schoolsLevel2', MapZoom.LEVEL_2, MapZoom.LEVEL_2);
  addDynamicTileSource(STYLE, 'schoolsLevel1', MapZoom.LEVEL_1, MapZoom.LEVEL_1);

  addLayer(STYLE, 'midblocks', 'line', {
    paint: {
      'line-color': PAINT_COLOR_CENTRELINE,
      'line-width': PAINT_WIDTH_MIDBLOCKS,
      'line-opacity': PAINT_OPACITY,
    },
  });
  addLayer(STYLE, 'intersections', 'circle', {
    paint: {
      'circle-color': PAINT_COLOR_CENTRELINE,
      'circle-radius': PAINT_RADIUS_INTERSECTIONS,
      'circle-opacity': PAINT_OPACITY,
    },
  });
  addLayer(STYLE, 'counts', 'circle', {
    paint: {
      'circle-color': PAINT_COLOR_COUNTS,
      'circle-radius': PAINT_RADIUS_COUNTS,
      'circle-opacity': PAINT_OPACITY,
    },
  });
  addLayer(STYLE, 'collisionsLevel3', 'heatmap', {
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
        STYLE.sources.collisionsLevel3.minzoom, 1,
        STYLE.sources.collisionsLevel3.maxzoom, 3,
      ],
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        STYLE.sources.collisionsLevel3.maxzoom, 0.8,
        STYLE.sources.collisionsLevel3.maxzoom + 1, 0,
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        STYLE.sources.collisionsLevel3.minzoom, 5,
        STYLE.sources.collisionsLevel3.maxzoom, 10,
      ],
      'heatmap-weight': ['get', 'heatmap_weight'],
    },
  });
  addLayer(STYLE, 'collisionsLevel2', 'circle', {
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
        STYLE.sources.collisionsLevel2.minzoom, 0.2,
        STYLE.sources.collisionsLevel2.minzoom + 1, [
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
  addLayer(STYLE, 'collisionsLevel1', 'circle', {
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
  addLayer(STYLE, 'schoolsLevel2', 'symbol', {
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
  addLayer(STYLE, 'schoolsLevel1', 'symbol', {
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
  return STYLE;
}

function getFeatureKey(feature) {
  if (feature === null) {
    return null;
  }
  const { layer: { id: layerId }, id } = feature;
  return `${layerId}:${id}`;
}

export default {
  name: 'FcPaneMap',
  components: {
    FcButton,
    FcPaneMapPopup,
    FcSearchBarLocation,
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
      // used to add slight debounce delay (250ms) to hovered popup
      featureKeyHoveredPopup: false,
      // keeps track of currently selected feature
      selectedFeature: null,
    };
  },
  computed: {
    featureKeyHovered() {
      return getFeatureKey(this.hoveredFeature);
    },
    featureKeySelected() {
      return getFeatureKey(this.selectedFeature);
    },
    ...mapState(['drawerOpen', 'location']),
  },
  created() {
    this.map = null;
  },
  mounted() {
    const bounds = BOUNDS_TORONTO;
    const mapStyle = new GeoStyle(rootStyleDark, metadataDark).get();
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
          minzoom: MapZoom.LEVEL_3.minzoom,
          maxzoom: MapZoom.LEVEL_1.maxzoomLayer,
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
        minZoom: MapZoom.MIN,
        maxZoom: MapZoom.MAX,
        pitchWithRotate: false,
        renderWorldCopies: false,
        style: this.mapStyle,
        zoom: MapZoom.MIN,
      });
      this.updateCoordinates();
      this.map.addControl(
        new mapboxgl.AttributionControl({
          customAttribution: [
            '<a href="https://docs.mapbox.com/mapbox-gl-js/overview/">Mapbox GL</a>',
            'Powered by <a href="https://www.esri.com/">Esri</a>',
          ],
        }),
        'bottom-right',
      );
      this.map.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 192, unit: 'metric' }),
        'bottom-right',
      );
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
        this.loading = false;
        this.updateSelectedFeature();
      });
      this.updateSelectedMarker();
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
    hoveredFeature: debounce(function watchHoveredFeature() {
      this.featureKeyHoveredPopup = this.featureKeyHovered;
    }, 250),
    location(location, oldLocation) {
      this.updateSelectedMarker();
      if (this.location === null) {
        this.clearSelectedFeature();
        return;
      }
      const feature = this.getFeatureForLocation(this.location);
      if (this.selectedFeature !== null && feature !== null) {
        this.setSelectedFeature(feature);
      } else {
        this.easeToLocation(location, oldLocation);
      }
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
      }
    },
    easeToLocation(location, oldLocation) {
      if (location !== null) {
        // zoom to location
        const { lat, lng } = location;
        const center = new mapboxgl.LngLat(lng, lat);
        const zoom = Math.max(this.map.getZoom(), MapZoom.LEVEL_1.minzoom);
        this.map.easeTo({
          center,
          duration: 1000,
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
          duration: 1000,
          zoom: MapZoom.LEVEL_3.minzoom,
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
          'midblocks',
          'centrelineId',
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
            'centrelineId',
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
     *
     * @param {Object} point - `(x, y)` coordinates of mouse
     * @returns {Object?} the matched feature, or `null` if no such feature
     */
    getFeatureForPoint(point, options) {
      const defaultOptions = {
        selectableOnly: false,
      };
      const featureOptions = {
        ...defaultOptions,
        ...options,
      };
      const { selectableOnly } = featureOptions;

      const layers = [
        'counts',
        'intersections',
        'midblocks',
      ];
      if (!selectableOnly) {
        layers.push(
          'collisionsLevel2',
          'collisionsLevel1',
          'schoolsLevel2',
          'schoolsLevel1',
        );
      }

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
      return features[0];
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
        const {
          featureCode,
          name: descriptionVisible,
        } = locationFeature.properties;
        elementInfo.description = descriptionVisible;
        elementInfo.featureCode = featureCode;
      }
      this.setLocation(elementInfo);
    },
    onCentrelineClick(feature, centrelineType) {
      // update location
      const [lng, lat] = getGeometryMidpoint(feature.geometry);
      const {
        centrelineId,
        featureCode,
        name: description,
      } = feature.properties;
      const elementInfo = {
        centrelineId,
        centrelineType,
        description,
        featureCode,
        lat,
        lng,
      };
      this.setLocation(elementInfo);
    },
    onMapClick(e) {
      const feature = this.getFeatureForPoint(e.point, {
        selectableOnly: true,
      });
      this.setSelectedFeature(feature);
      if (feature === null) {
        return;
      }
      const layerId = feature.layer.id;
      if (layerId === 'counts') {
        this.onCountsClick(feature);
      } else if (layerId === 'intersections') {
        this.onCentrelineClick(feature, CentrelineType.INTERSECTION);
      } else if (layerId === 'midblocks') {
        this.onCentrelineClick(feature, CentrelineType.SEGMENT);
      }
    },
    onMapMousemove(e) {
      const feature = this.getFeatureForPoint(e.point);
      this.setHoveredFeature(feature);
    },
    onMapMove: debounce(function onMapMove() {
      this.updateCoordinates();
    }, 250),
    openGoogleMaps() {
      if (this.coordinates === null) {
        return;
      }
      const { lat, lng, zoom } = this.coordinates;
      const z = Math.round(zoom);
      const url = `https://www.google.com/maps/@${lat},${lng},${z}z`;
      window.open(url, '_blank');
    },
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
      const feature = this.getFeatureForLocation(this.location);
      if (feature === null) {
        this.clearSelectedFeature();
      } else {
        this.setSelectedFeature(feature);
      }
    },
    updateSelectedMarker() {
      if (this.location === null) {
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

<style lang="scss">
.pane-map {
  background-color: var(--white);
  &.mapboxgl-map {
    font: inherit;
  }
  & > .pane-map-progress {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: var(--z-index-controls);
  }
  & > .fc-search-bar-location {
    top: 20px;
    position: absolute;
    left: 20px;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-mode {
    bottom: 35px;
    position: absolute;
    right: 54px;
    z-index: var(--z-index-controls);
  }
  .mapboxgl-ctrl-bottom-right {
    & > .mapboxgl-ctrl-group {
      bottom: 25px;
      position: absolute;
      right: 6px;
    }
    & > .mapboxgl-ctrl-scale {
      background-color: rgba(0, 0, 0, 0.2);
      border-color: #dcdee0;
      bottom: 0;
      color: #dcdee0;
      font-size: 0.75rem;
      height: 17px;
      line-height: 0.875rem;
      position: absolute;
      right: 170px;
    }
    & > .mapboxgl-ctrl-attrib {
      background-color: rgba(0, 0, 0, 0.2);
      bottom: 10px;
      color: #dcdee0;
      font-size: 0.75rem;
      line-height: 0.875rem;
      padding: 2px 5px;
      position: absolute;
      right: 5px;
      width: 170px;
    }
  }
}
</style>
