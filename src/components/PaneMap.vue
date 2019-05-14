<template>
  <div class="pane-map">
    <div class="pane-map-google-maps">
      <button>
        <span v-if="coordinates === null">Google Maps</span>
        <a v-else :href="hrefGoogleMaps" target="_blank">Google Maps</a>
      </button>
    </div>
    <div class="pane-map-mode">
      <button @click="toggleSatellite">
        {{ satellite ? 'Map' : 'Aerial' }}
      </button>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';
import { mapState } from 'vuex';

import GeoStyle from '@/lib/geo/GeoStyle';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);
const ZOOM_TORONTO = 10;
const ZOOM_LOCATION = 17;
const ZOOM_MAX = 19;

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
    ...mapState(['location']),
  },
  created() {
    this.map = null;
  },
  mounted() {
    const bounds = new mapboxgl.LngLatBounds(
      new mapboxgl.LngLat(-79.639264937, 43.580995995),
      new mapboxgl.LngLat(-79.115243191, 43.855457183),
    );

    this.centrelineStyle = {
      version: 8,
      sources: {
        'centreline-tiles': {
          type: 'vector',
          tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/centreline.pbf/{y}/{x}/{z}'],
        },
      },
      layers: [
        {
          id: 'centreline',
          source: 'centreline-tiles',
          type: 'line',
          paint: {
            'fill-color': '#000000',
          },


        },

      ],
    };

    this.intersectionStyle = {
      version: 8,
      sources: {
        'int-tiles': {
          type: 'vector',
          tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/intersections.pbf/{y}/{x}/{z}'],
        },
      },
      layers: [
        {
          id: 'intersections',
          source: 'int-tiles',
          type: 'circle',
          paint: {
            'fill-color': '#000000',
          },


        },

      ],
    };

    this.mapStyle = GeoStyle.get();
    // see https://docs.mapbox.com/mapbox-gl-js/example/map-tiles/
    this.satelliteStyle = {
      version: 8,
      sources: {
        'gcc-ortho-webm': {
          type: 'raster',
          tiles: [
            'https://gis.toronto.ca/arcgis/rest/services/primary/cot_ortho_webm/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
        },
        'centreline-tiles': {
          type: 'vector',
          tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/centreline/{z}/{x}/{y}.pbf'],
        },
        'intersection-tiles' : {
          type: 'vector',
          tiles: ['https://flashcrow.intra.dev-toronto.ca/tiles/intersections/{z}/{x}/{y}.pbf'],
        }
      },
      layers: [
      {
        id: 'gcc-ortho-webm',
        type: 'raster',
        source: 'gcc-ortho-webm',
        minzoom: 0,
        maxzoom: 23,
      },
      {
          id: 'centreline',
          source: 'centreline-tiles',
          'source-layer': 'centreline',
          type: 'line',
          minzoom: 10,
          maxZoom: 15,
      },
      {
          id: 'intersections',
          source: 'intersection-tiles',
          'source-layer': 'centreline_intersection',
          type: 'circle',
          minzoom: 11,
          maxZoom: 15,
      }
      ],
    };
    Vue.nextTick(() => {
      this.loading = false;
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
      this.map.on('move', this.updateCoordinates.bind(this));
      this.easeToLocation();
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
