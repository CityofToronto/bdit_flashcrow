<template>
  <div class="pane-map-popup">
    <div class="mb-m pr-xl">
      <i class="fa fa-map-marker-alt"></i>
      <strong v-if="descriptionFormatted"> {{descriptionFormatted}}</strong>
      <span v-else class="text-muted"> name unknown</span>
    </div>
    <button
      v-if="layerId === 'counts-visible-clusters'"
      @click="onZoomIn">
      Zoom In
    </button>
    <button
      v-else
      class="font-size-l"
      @click="onViewData">
      View Data
    </button>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import StringFormatters from '@/lib/StringFormatters';
import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';

export default {
  name: 'PaneMapPopup',
  props: {
    feature: Object,
  },
  inject: {
    map: {
      default: null,
    },
  },
  computed: {
    centrelineId() {
      if (this.layerId === 'centreline') {
        return this.feature.properties.geo_id;
      }
      if (this.layerId === 'intersections') {
        return this.feature.properties.int_id;
      }
      return this.feature.properties.centrelineId;
    },
    centrelineType() {
      if (this.layerId === 'centreline') {
        return CentrelineType.SEGMENT;
      }
      if (this.layerId === 'intersections') {
        return CentrelineType.INTERSECTION;
      }
      return this.feature.properties.centrelineType;
    },
    coordinates() {
      const { coordinates } = this.feature.geometry;
      if (this.layerId === 'centreline') {
        return getLineStringMidpoint(coordinates);
      }
      return coordinates;
    },
    description() {
      if (this.layerId === 'centreline') {
        return this.feature.properties.lf_name;
      }
      if (this.layerId === 'intersections') {
        return this.feature.properties.intersec5;
      }
      if (this.layerId === 'counts-visible-clusters') {
        const n = this.feature.properties.point_count_abbreviated;
        return `${n} locations`;
      }
      return this.feature.properties.locationdesc;
    },
    descriptionFormatted() {
      if (this.description) {
        return StringFormatters.formatCountLocationDescription(this.description);
      }
      return null;
    },
    layerId() {
      return this.feature.layer.id;
    },
  },
  created() {
    this.popup = new mapboxgl.Popup({
      closeOnClick: false,
      maxWidth: 'none',
    });
  },
  mounted() {
    Vue.nextTick(this.refreshPopup.bind(this));
  },
  updated() {
    Vue.nextTick(this.refreshPopup.bind(this));
  },
  beforeDestroy() {
    if (this.map) {
      this.popup.remove();
    }
  },
  methods: {
    onViewData() {
      // update location
      const [lng, lat] = this.coordinates;
      const elementInfo = {
        centrelineId: this.centrelineId,
        centrelineType: this.centrelineType,
        description: this.description,
        lng,
        lat,
      };
      this.setLocation(elementInfo);

      // open the view data window
      const routerParameters = {
        centrelineId: this.centrelineId,
        centrelineType: this.centrelineType,
      };
      this.$router.push({
        name: 'viewDataAtLocation',
        params: routerParameters,
      });
    },
    onZoomIn() {
      this.$emit('zoom-in', this.feature);
    },
    refreshPopup() {
      this.popup
        .setLngLat(this.coordinates)
        .setDOMContent(this.$el)
        .addTo(this.map);
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="postcss">
.pane-map-popup {
  background-color: white;
}
</style>
