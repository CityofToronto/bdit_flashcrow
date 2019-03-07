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
    const style = GeoStyle.get();
    Vue.nextTick(() => {
      this.map = new mapboxgl.Map({
        container: this.$el,
        dragRotate: false,
        pitchWithRotate: false,
        style,
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
