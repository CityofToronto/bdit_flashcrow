<template>
  <div class="card-map">
    <div class="card-map-locate">
      <b-input-group>
        <b-form-input
          v-model="locationQuery"
          class="input-location-query"
          type="text"
          placeholder="Search for a location" />
        <b-input-group-append>
          <b-button size="sm" text="Search" variant="success">Search</b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
    <div class="card-map-sidebar" :class="{ open: showSidebar }">
      <b-form-group label="Layers:">
        <b-form-checkbox-group
          v-model="layers"
          :options="optionsLayers" />
      </b-form-group>
      <div class="card-map-sidebar-toggle" @click="showSidebar = !showSidebar">
        <strong>{{ showSidebar ? '&lt;' : '&gt;' }}</strong>
      </div>
    </div>
    <div class="card-map-mode">
      <button class="btn-mode" @click="toggleSatellite">
        {{ satellite ? 'Map' : 'Satellite' }}
      </button>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';

import GeoStyle from '@/lib/geo/GeoStyle';

export default {
  name: 'CardMap',
  data() {
    return {
      layers: [],
      locationQuery: '',
      optionsLayers: [
        { text: 'Collisions', value: 'COLLISIONS' },
        { text: 'Counts', value: 'COUNTS' },
      ],
      satellite: false,
      showSidebar: true,
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
        minZoom: 11,
        pitchWithRotate: false,
        renderWorldCopies: false,
        style: this.mapStyle,
        zoom: 11,
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
  flex-grow: 1;
  position: relative;
  & > .card-map-locate {
    left: 8px;
    position: absolute;
    top: 8px;
    width: 320px;
    z-index: 999;
  }
  & > .card-map-sidebar {
    background-color: #fff;
    border-radius: 0 8px 8px 0;
    height: 92px;
    left: 0;
    padding: 8px;
    position: absolute;
    transition: width 100ms ease-in-out;
    top: 64px;
    width: 0;
    z-index: 999;
    .form-control {
      display: inline-block;
    }
    & > .form-group {
      display: none;
    }
    & > .card-map-sidebar-toggle {
      border: 1px solid #ccc;
      border-right: 0;
      border-radius: 4px 0 0 4px;
      bottom: 16px;
      color: #999;
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      position: absolute;
      right: 0;
      transition: background-color 100ms ease-in-out;
      &:hover {
        background-color: #ccc;
      }
    }
    &.open {
      width: 160px;
      & > .form-group {
        display: block;
      }
    }
  }
  & > .card-map-mode {
    bottom: 8px;
    position: absolute;
    right: 64px;
    z-index: 999;
  }
}
</style>
