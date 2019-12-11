<template>
  <div class="pane-map-popup">
    <TdsPanel
      :icon="icon"
      :variant="variant">
      <div class="ml-l">
        <strong v-if="descriptionFormatted"> {{descriptionFormatted}}</strong>
        <span v-else class="text-muted"> name unknown</span>
      </div>
      <button
        class="font-size-l mt-s"
        @click="onViewData">
        View Data
      </button>
    </TdsPanel>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';
import TdsPanel from '@/web/components/tds/TdsPanel.vue';

export default {
  name: 'PaneMapPopup',
  components: {
    TdsPanel,
  },
  props: {
    feature: Object,
    hover: Boolean,
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
          return '1 count station';
        }
        return `${numArteryCodes} count stations`;
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
    icon() {
      return this.hover ? 'hand-pointer' : 'map-marker-alt';
    },
    layerId() {
      return this.feature.layer.id;
    },
    variant() {
      return this.hover ? 'warning' : 'success';
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
      this.setDrawerOpen(true);
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
    ...mapMutations(['setDrawerOpen', 'setLocation']),
  },
};
</script>

<style lang="postcss">
.pane-map-popup {
  & > .tds-panel {
    border-radius: var(--space-s);
    box-shadow: var(--shadow-2);
  }

  left: var(--space-l);
  position: absolute;
  top: var(--space-m);
  width: var(--space-4xl);
  z-index: var(--z-index-controls);
}
</style>
