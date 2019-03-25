<template>
  <div
    class="card-map"
    :class="{'card-map-fade': requestStep > 1}">
    <div class="card-map-locate">
      <b-input-group>
        <b-input-group-prepend>
          <b-button
            variant="light">
            <b-img
              src="/flashcrow/icons/search-icon.svg"
              width="30"
              height="30"
              alt="Search" />
          </b-button>
        </b-input-group-prepend>
        <b-form-input
          v-model="locationQuery"
          class="input-location-query"
          size="lg"
          type="text"
          placeholder="Try &quot;Kingston and Lee&quot;" />
      </b-input-group>
    </div>
    <div class="card-map-mode">
      <b-button size="sm" @click="toggleSatellite">
        {{ satellite ? 'Map' : 'Aerial' }}
      </b-button>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';

import GeoStyle from '@/lib/geo/GeoStyle';

export default {
  name: 'CardMap',
  props: {
    requestStep: Number,
  },
  data() {
    return {
      layers: [],
      locationQuery: '',
      optionsLayers: [
        { text: 'Collisions', value: 'COLLISIONS' },
        { text: 'Counts', value: 'COUNTS' },
      ],
      satellite: false,
      showSidebar: false,
    };
  },
  mounted() {
    const bounds = new mapboxgl.LngLatBounds(
      new mapboxgl.LngLat(-79.939957, 43.507725),
      new mapboxgl.LngLat(-78.852997, 43.899377),
    );
    const center = new mapboxgl.LngLat(-79.396477, 43.703871);
    this.mapStyle = GeoStyle.get();
    // see https://docs.mapbox.com/mapbox-gl-js/example/map-tiles/
    this.satelliteStyle = {
      version: 8,
      sources: {
        'gcc-ortho-webm': {
          type: 'raster',
          tiles: [
            'https://insideto-gis.toronto.ca/arcgis/rest/services/primary/cot_ortho_webm/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
        },
      },
      layers: [{
        id: 'gcc-ortho-webm',
        type: 'raster',
        source: 'gcc-ortho-webm',
        minzoom: 0,
        maxzoom: 23,
      }],
    };
    Vue.nextTick(() => {
      this.map = new mapboxgl.Map({
        bounds,
        center,
        container: this.$el,
        dragRotate: false,
        maxBounds: bounds,
        maxZoom: 15,
        minZoom: 10,
        pitchWithRotate: false,
        renderWorldCopies: false,
        style: this.mapStyle,
        zoom: 10,
      });
      this.map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right',
      );
    });
  },
  beforeDestroy() {
    this.map.remove();
  },
  methods: {
    toggleSatellite() {
      this.satellite = !this.satellite;
      if (this.satellite) {
        this.map.setStyle(this.satelliteStyle, { diff: false });
      } else {
        this.map.setStyle(this.mapStyle, { diff: false });
      }
    },
  },
};
</script>

<style lang="postcss">
.card-map {
  height: calc(100% - 300px);
  opacity: 1;
  position: relative;
  transition: 250ms opacity ease-in-out;
  &.card-map-fade {
    opacity: 0.3;
  }
  & > .card-map-locate {
    left: 40px;
    position: absolute;
    top: 22px;
    width: 380px;
    z-index: 999;
    & input {
      font-family: 'Work Sans';
      font-size: 12pt;
    }
  }
  & > .card-map-mode {
    bottom: 122px;
    position: absolute;
    right: 40px;
    z-index: 999;
  }
}
.input-location-query {
   box-shadow: 3px 2px 0 1px rgba(208, 208, 208, 0.23), inset 0 1px 3px 0 rgba(255, 255, 255, 0.5);
}
.mapboxgl-ctrl-bottom-right {
  bottom: 155px;
  right: 31px;
}
</style>
