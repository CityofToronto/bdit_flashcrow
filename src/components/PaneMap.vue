<template>
  <div class="pane-map">
    <div
      v-if="loading"
      class="pane-map-loading-spinner">
      <TdsLoadingSpinner />
    </div>
    <div class="pane-map-google-maps">
      <button class="font-size-l">
        <span v-if="coordinates === null">Google Maps</span>
        <a v-else :href="hrefGoogleMaps" target="_blank">Google Maps</a>
      </button>
    </div>
    <div class="pane-map-mode">
      <button class="font-size-l" @click="toggleSatellite">
        {{ satellite ? 'Map' : 'Aerial' }}
      </button>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';

import TdsLoadingSpinner from '@/components/tds/TdsLoadingSpinner.vue';
import apiFetch from '@/lib/ApiFetch';
import Constants from '@/lib/Constants';
import FunctionUtils from '@/lib/FunctionUtils';
import StringFormatters from '@/lib/StringFormatters';
import GeoStyle from '@/lib/geo/GeoStyle';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);
const ZOOM_TORONTO = 10;
const ZOOM_MIN_COUNTS = 14;
const ZOOM_LOCATION = 17;
const ZOOM_MAX = 19;

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
    // normal
    '#00bde3',
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
  8,
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    8,
    // normal
    6,
  ],
];
const PAINT_SIZE_COUNT_POINTS = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  // selected
  12,
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    12,
    // normal
    10,
  ],
];
const PAINT_SIZE_COUNT_CLUSTERS = [
  'case',
  ['boolean', ['feature-state', 'hover'], false],
  // hovered
  22,
  // normal
  20,
];
const PAINT_OPACITY = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  // selected
  0.9,
  [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    // hovered
    0.9,
    // normal
    0.75,
  ],
];

function injectCentrelineVectorTiles(style) {
  const STYLE = {};
  Object.assign(STYLE, style);

  STYLE.sources.centreline = {
    type: 'vector',
    tiles: ['https://move.intra.dev-toronto.ca/tiles/centreline/{z}/{x}/{y}.pbf'],
  };


  STYLE.sources.intersections = {
    type: 'vector',
    tiles: ['https://move.intra.dev-toronto.ca/tiles/intersections/{z}/{x}/{y}.pbf'],
  };

  STYLE.layers.push({
    id: 'centreline',
    source: 'centreline',
    'source-layer': 'centreline',
    type: 'line',
    minzoom: 10,
    maxZoom: 15,
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
    minzoom: 11,
    maxZoom: 15,
    paint: {
      'circle-color': PAINT_COLOR_CENTRELINE,
      'circle-radius': PAINT_SIZE_INTERSECTIONS,
      'circle-opacity': PAINT_OPACITY,
    },
  });

  return STYLE;
}


export default {
  name: 'PaneMap',
  components: {
    TdsLoadingSpinner,
  },
  props: {
    cols: Number,
  },
  data() {
    return {
      coordinates: null,
      loading: false,
      satellite: false,
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
    ...mapState(['location', 'locationQuery', 'showMap']),
  },
  created() {
    this.map = null;
  },
  mounted() {
    const bounds = new mapboxgl.LngLatBounds(
      new mapboxgl.LngLat(-79.639264937, 43.580995995),
      new mapboxgl.LngLat(-79.115243191, 43.855457183),
    );

    this.mapStyle = injectCentrelineVectorTiles(GeoStyle.get());
    this.satelliteStyle = injectCentrelineVectorTiles({
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
          minzoom: 0,
          maxzoom: 23,
        },
      ],
    });

    // keeps track of which feature we are currently hovering over
    this.hoveredFeature = null;

    Vue.nextTick(() => {
      this.loading = false;
      this.dataCountsVisible = {
        type: 'FeatureCollection',
        features: [],
      };
      this.map = new mapboxgl.Map({
        bounds,
        boxZoom: false,
        container: this.$el,
        dragRotate: false,
        maxBounds: bounds,
        maxZoom: ZOOM_MAX,
        minZoom: ZOOM_TORONTO,
        pitchWithRotate: false,
        renderWorldCopies: false,
        style: this.mapStyle,
        zoom: ZOOM_TORONTO,
      });
      this.map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right',
      );
      this.map.on('load', () => {
        this.map.addSource('counts-visible', {
          type: 'geojson',
          data: this.dataCountsVisible,
          cluster: true,
          clusterMaxZoom: ZOOM_MAX,
        });
        this.map.addLayer({
          id: 'counts-visible-clusters',
          type: 'circle',
          source: 'counts-visible',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': PAINT_COLOR_COUNTS,
            'circle-opacity': PAINT_OPACITY,
            'circle-radius': PAINT_SIZE_COUNT_CLUSTERS,
          },
        });
        this.map.addLayer({
          id: 'counts-visible-cluster-counts',
          type: 'symbol',
          source: 'counts-visible',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Ubuntu Regular'],
            'text-size': 18,
          },
          paint: {
            'text-color': '#1b1b1b',
          },
        });
        this.map.addLayer({
          id: 'counts-visible-points',
          type: 'circle',
          source: 'counts-visible',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': PAINT_COLOR_COUNTS,
            'circle-opacity': PAINT_OPACITY,
            'circle-radius': PAINT_SIZE_COUNT_POINTS,
          },
        });
        this.map.on('move', this.onMapMove.bind(this));
        this.easeToLocation();
        this.map.on('click', this.onMapClick.bind(this));
        this.map.on('mousemove', this.onMapMousemove.bind(this));
        this.map.on('mouseout', this.onMapMouseout.bind(this));
      });
    });
  },
  beforeDestroy() {
    this.map.remove();
  },
  watch: {
    location() {
      this.easeToLocation();
    },
    $route() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
    showMap() {
      if (this.showMap === true) {
        Vue.nextTick(() => {
          this.map.resize();
        });
      }
    },
  },
  methods: {
    easeToLocation() {
      if (this.location === null) {
        // zoom to Toronto
        const center = BOUNDS_TORONTO.getCenter();
        this.map.easeTo({
          center,
          zoom: ZOOM_TORONTO,
        });
      } else {
        // zoom to location
        const { lat, lng } = this.location;
        const center = new mapboxgl.LngLat(lng, lat);
        this.map.easeTo({
          center,
          zoom: ZOOM_LOCATION,
        });
      }
    },
    fetchVisibleCounts(bounds) {
      const xmin = bounds.getWest();
      const ymin = bounds.getSouth();
      const xmax = bounds.getEast();
      const ymax = bounds.getNorth();
      const data = {
        f: Constants.Format.GEOJSON,
        xmin,
        ymin,
        xmax,
        ymax,
      };
      const options = { data };
      this.loading = true;
      return apiFetch('/counts/byBoundingBox', options)
        .then((dataCountsVisible) => {
          this.dataCountsVisible = dataCountsVisible;
          this.map.getSource('counts-visible')
            .setData(this.dataCountsVisible);
          this.loading = false;
          return dataCountsVisible;
        });
    },
    onCentrelineClick(feature) {
      /*
       * Estimate the point halfway along this line.
       *
       * TODO: make this do the same thing as ST_Closest(geom, ST_Centroid(geom)), which we
       * use in our Airflow jobs and backend API as a (better) estimate of halfway points.
       */
      const { coordinates } = feature.geometry;
      const i = Math.floor(coordinates.length / 2);
      const [lng, lat] = coordinates[i];
      const elementInfo = {
        centrelineId: feature.properties.geo_id,
        centrelineType: Constants.CentrelineType.SEGMENT,
        description: feature.properties.lf_name,
        lat,
        lng,
      };
      this.setLocation(elementInfo);
    },
    onCountsVisibleClustersClick(feature) {
      const clusterId = feature.properties.cluster_id;
      this.map.getSource('counts-visible')
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) {
            return;
          }
          const center = feature.geometry.coordinates;
          this.map.easeTo({ center, zoom });
        });
    },
    onCountsVisiblePointsClick(feature) {
      const [lng, lat] = feature.geometry.coordinates;
      const {
        centrelineId,
        centrelineType,
        locationDesc,
      } = feature.properties;
      const description = StringFormatters.formatCountLocationDescription(locationDesc);
      const elementInfo = {
        centrelineId,
        centrelineType,
        description,
        lat,
        lng,
      };
      this.setLocation(elementInfo);
    },
    onIntersectionsClick(feature) {
      // update location
      const [lng, lat] = feature.geometry.coordinates;
      const elementInfo = {
        centrelineId: feature.properties.int_id,
        centrelineType: Constants.CentrelineType.INTERSECTION,
        description: feature.properties.intersec5,
        lat,
        lng,
      };
      this.setLocation(elementInfo);
    },
    onMapClick(e) {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [
          'centreline',
          'counts-visible-clusters',
          'counts-visible-points',
          'intersections',
        ],
      });
      if (features.length === 0) {
        return;
      }
      const [feature] = features;
      const layerId = feature.layer.id;
      if (layerId === 'centreline') {
        this.onCentrelineClick(feature);
      } else if (layerId === 'counts-visible-clusters') {
        this.onCountsVisibleClustersClick(feature);
      } else if (layerId === 'counts-visible-points') {
        this.onCountsVisiblePointsClick(feature);
      } else if (layerId === 'intersections') {
        this.onIntersectionsClick(feature);
      }
    },
    onMapMousemove(e) {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [
          'centreline',
          'counts-visible-clusters',
          'counts-visible-points',
          'intersections',
        ],
      });
      const canvas = this.map.getCanvas();
      if (features.length === 0) {
        canvas.style.cursor = '';
        if (this.hoveredFeature !== null) {
          this.map.setFeatureState(this.hoveredFeature, { hover: false });
          this.hoveredFeature = null;
        }
      } else {
        canvas.style.cursor = 'pointer';

        // unhighlight features that are currently highlighted
        if (this.hoveredFeature !== null) {
          this.map.setFeatureState(this.hoveredFeature, { hover: false });
        }
        // highlight feature that is currently being hovered over
        [this.hoveredFeature] = features;
        this.map.setFeatureState(this.hoveredFeature, { hover: true });
      }
    },
    onMapMouseout() {
      if (this.hoveredFeature !== null) {
        this.map.setFeatureState(this.hoveredFeature, { hover: false });
        this.hoveredFeature = null;
      }
    },
    onMapMove: FunctionUtils.debounce(function onMapMove() {
      const { lat, lng } = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.coordinates = { lat, lng, zoom };

      if (zoom >= ZOOM_MIN_COUNTS) {
        const bounds = this.map.getBounds();
        this.fetchVisibleCounts(bounds);
      } else {
        this.dataCountsVisible.features = [];
        this.map.getSource('counts-visible')
          .setData(this.dataCountsVisible);
      }
    }, 250),
    toggleSatellite() {
      this.satellite = !this.satellite;
      if (this.satellite) {
        this.map.setStyle(this.satelliteStyle, { diff: false });
      } else {
        this.map.setStyle(this.mapStyle, { diff: false });
      }
    },
    ...mapMutations(['setLocation']),
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
    right: 15px;
    top: 8px;
    width: calc(var(--space-xl) + var(--space-s) * 2);
    z-index: var(--z-index-controls);
  }
  & > .pane-map-google-maps {
    bottom: 8px;
    position: absolute;
    left: 15px;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-mode {
    bottom: 8px;
    position: absolute;
    right: 15px;
    z-index: var(--z-index-controls);
  }
  .mapboxgl-ctrl-bottom-right {
    bottom: 38px;
    right: 5px;
  }
}
</style>
