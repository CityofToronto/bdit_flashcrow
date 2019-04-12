<template>
  <b-col class="pane-map" :cols="cols"></b-col>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';

import GeoStyle from '@/lib/geo/GeoStyle';

export default {
  name: 'PaneMap',
  props: {
    cols: Number,
  },
  data() {
    return {
      satellite: false,
    };
  },
  mounted() {
    const bounds = new mapboxgl.LngLatBounds(
      new mapboxgl.LngLat(-79.639264937, 43.580995995),
      new mapboxgl.LngLat(-79.115243191, 43.855457183),
    );
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
        boxZoom: false,
        container: this.$el,
        dragRotate: false,
        maxBounds: bounds,
        maxZoom: 19,
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
.pane-map {
  background-color: #fff;
}
</style>
