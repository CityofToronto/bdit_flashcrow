<template>
  <div class="pane-map-popup text-center p-m">
    <div>
      <i class="fa fa-map-marker-alt"></i>
      <strong v-if="descriptionFormatted"> {{descriptionFormatted}}</strong>
      <span v-else class="text-muted"> name unknown</span>
    </div>
    <button
      class="font-size-l mt-m"
      @click="onViewData">
      View Data
    </button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';

export default {
  name: 'PaneMapPopup',
  props: {
    feature: Object,
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
      if (this.layerId === 'counts') {
        const { numArteryCodes } = this.feature.properties;
        if (numArteryCodes === 1) {
          return '1 location';
        }
        return `${numArteryCodes} locations`;
      }
      if (this.layerId === 'intersections') {
        return this.feature.properties.intersec5;
      }
      return this.feature.properties.locationDesc;
    },
    descriptionFormatted() {
      if (this.description) {
        return formatCountLocationDescription(this.description);
      }
      return null;
    },
    featureCode() {
      if (this.layerId === 'centreline') {
        return this.feature.properties.fcode;
      }
      if (this.layerId === 'intersections') {
        return this.feature.properties.elevatio9;
      }
      /*
       * In this case, we don't have a reliable feature code we can use.  Eventually, we should
       * change `CountDAO` to provide this when returning counts.
       */
      return null;
    },
    layerId() {
      return this.feature.layer.id;
    },
  },
  methods: {
    onViewData() {
      // update location
      const [lng, lat] = this.coordinates;
      const elementInfo = {
        centrelineId: this.centrelineId,
        centrelineType: this.centrelineType,
        description: this.description,
        featureCode: this.featureCode,
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
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="postcss">
.pane-map-popup {
  background-color: white;
  border: var(--border-default);
  border-radius: var(--space-s);
  box-shadow: var(--shadow-2);
  left: 8px;
  position: absolute;
  top: 8px;
  width: var(--space-4xl);
  z-index: var(--z-index-controls);
}
</style>
