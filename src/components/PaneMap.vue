<template>
  <div class="pane-map">
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

import apiFetch from '@/lib/ApiFetch';
import FunctionUtils from '@/lib/FunctionUtils';
import GeoStyle from '@/lib/geo/GeoStyle';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);
const ZOOM_TORONTO = 10;
const ZOOM_MIN_COUNTS = 15;
const ZOOM_LOCATION = 17;
const ZOOM_MAX = 19;

function injectCentrelineVectorTiles(style) {
  const STYLE = {};
  Object.assign(STYLE, style);

  STYLE.sources.centreline = {
    type: 'vector',
    tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/centreline/{z}/{x}/{y}.pbf'],
  };


  STYLE.sources.intersections = {
    type: 'vector',
    tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/intersections/{z}/{x}/{y}.pbf'],
  };


  STYLE.layers.push({
    id: 'centreline',
    source: 'centreline',
    'source-layer': 'centreline',
    type: 'line',
    minzoom: 10,
    maxZoom: 15,
    paint: {
      'line-width': 3,
      'line-opacity': ['case',
        ['boolean', ['feature-state', 'hover'], false], 0.5, 1],
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
      'circle-opacity': ['case',
        ['boolean', ['feature-state', 'hover'], false], 0.5, 1],
    },
  });

  return STYLE;
}


export default {
  name: 'PaneMap',
  props: {
    cols: Number,
  },
  data() {
    return {
      coordinates: null,
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
    ...mapState(['location', 'locationQuery']),
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
        });
        this.map.addLayer({
          id: 'counts-visible',
          type: 'circle',
          source: 'counts-visible',
          paint: {
            'circle-color': '#0050d8',
            'circle-radius': 10,
          },
        });
        this.map.on('move', this.onMapMove.bind(this));
      });
      this.easeToLocation();
      this.map.on('click', 'intersections', this.intersectionPopup.bind(this));
      this.map.on('mousemove', 'intersections', this.elementHover.bind(this));
      this.map.on('mouseout', 'intersections', this.elementLeaveHover.bind(this));
      this.map.on('click', 'centreline', this.centrelinePopup.bind(this));
      this.map.on('mousemove', 'centreline', this.elementHover.bind(this));
      this.map.on('mouseout', 'centreline', this.elementLeaveHover.bind(this));
    });
  },
  beforeDestroy() {
    this.map.remove();
  },
  watch: {
    location() {
      this.easeToLocation();
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
        xmin,
        ymin,
        xmax,
        ymax,
      };
      const options = { data };
      return apiFetch('/counts/byBoundingBox', options)
        .then((counts) => {
          this.dataCountsVisible.features = counts.map((count) => {
            const properties = Object.assign({}, count);
            delete properties.geom;
            return {
              type: 'Feature',
              geometry: count.geom,
              properties,
            };
          });
          this.map.getSource('counts-visible')
            .setData(this.dataCountsVisible);
        });
    },
    onMapMove: FunctionUtils.debounce(function onMapMove() {
      const { lat, lng } = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.coordinates = { lat, lng, zoom };

      if (zoom >= ZOOM_MIN_COUNTS) {
        const bounds = this.map.getBounds();
        this.fetchVisibleCounts(bounds)
          .then(result => console.log(result));
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
    intersectionPopup(e) {
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(JSON.stringify(e.features[0].properties.intersec5))
        .addTo(this.map);
      // update location
      const elementInfo = {
        description: e.features[0].properties.intersec5,
        geoId: e.features[0].properties.int_id,
        keystring: `INTERSECTION:geo_id:${e.features[0].properties.int_id}:rowid:`,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      };
      this.setLocation(elementInfo);
      this.setLocationQuery(e.features[0].properties.intersec5);
    },
    centrelinePopup(e) {
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(JSON.stringify(e.features[0].properties.lf_name))
        .addTo(this.map);
      const elementInfo = {
        description: e.features[0].properties.lf_name,
        geoId: e.features[0].properties.geo_id,
        keystring: `INTERSECTION:geo_id:${e.features[0].properties.geo_id}:rowid:`,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      };
      this.setLocation(elementInfo);
      this.setLocationQuery(e.features[0].properties.lf_name);
    },
    elementHover(e) {
      if (e.features.length > 0) {
        // unhighlight features that are currently highlighted
        if (this.hoveredFeature) {
          this.map.setFeatureState(this.hoveredFeature, { hover: false });
        }
        // highlight feature that is currently being hovered over
        [this.hoveredFeature] = e.features;
        this.map.setFeatureState(e.features[0], { hover: true });
      }
    },
    elementLeaveHover() {
      if (this.hoveredFeature) {
        this.map.setFeatureState(this.hoveredFeature, { hover: false });
      }
      this.hoveredFeature = null;
    },
    ...mapMutations(['setLocation', 'setLocationQuery']),
  },
};
</script>

<style lang="postcss">
.pane-map {
  background-color: var(--white);
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
