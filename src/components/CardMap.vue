<template>
  <div class="card card-map">
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';

import GeoStyle from '@/lib/geo/GeoStyle';

export default {
  name: 'CardMap',
  mounted() {
    const bounds = new mapboxgl.LngLatBounds(
      new mapboxgl.LngLat(-79.939957, 43.507725),
      new mapboxgl.LngLat(-78.852997, 43.899377),
    );
    const center = new mapboxgl.LngLat(-79.396477, 43.703871);
    const style = GeoStyle.get();
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
        style,
        zoom: 11,
      });
    });
  },
  beforeDestroy() {
    this.map.remove();
  },
};
</script>

<style lang="postcss">
.card-map {
  flex-grow: 1;
}
</style>
