<template>
  <div class="card card-map">
    <div class="card-map-locate">
      <input
        class="input-locate"
        type="text"
        name="locate"
        value=""
        placeholder="e.g. 'King and Bathurst', 'px:1234', '43.507725, -79.939957'" />
      <button class="btn-locate">Locate</button>
    </div>
    <div class="card-map-sidebar" :class="{ open: showSidebar }">
      <div class="card-map-sidebar-controls">
      <div><strong>layers</strong></div>
      <div class="form-control">
        <label for="chk_collisions">Collisions</label>
        <input id="chk_collisions" type="checkbox" name="layers" value="COLLISIONS">
      </div>
      <div class="form-control">
        <label for="chk_volume">Volume</label>
        <input id="chk_volume" type="checkbox" name="layers" value="VOLUME">
      </div>
      </div>
      <div class="card-map-sidebar-toggle" @click="showSidebar = !showSidebar">
        <strong>{{ showSidebar ? '&lt;' : '&gt;' }}</strong>
      </div>
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
      showSidebar: true,
    };
  },
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
      this.map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right',
      );
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
  position: relative;
  & > .card-map-locate {
    left: 8px;
    position: absolute;
    top: 8px;
    z-index: 999;
    & > input.input-locate {
      width: 360px;
    }
  }
  & > .card-map-sidebar {
    background-color: #fff;
    border-radius: 0 8px 8px 0;
    height: 50%;
    left: 0;
    padding: 8px;
    position: absolute;
    transition: width 100ms ease-in-out;
    top: 25%;
    width: 0;
    z-index: 999;
    .form-control {
      display: inline-block;
    }
    & > .card-map-sidebar-controls {
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
      width: 100px;
      & > .card-map-sidebar-controls {
        display: block;
      }
    }
  }
}
</style>
