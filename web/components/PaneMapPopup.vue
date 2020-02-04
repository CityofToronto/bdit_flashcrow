<template>
  <div class="pane-map-popup">
    <v-alert
      class="elevation-2"
      :color="color"
      :icon="icon">
      <div>
        <strong v-if="description">{{description}}</strong>
        <span v-else> name unknown</span>
      </div>
      <v-btn
        v-if="featureSelectable"
        class="mt-1"
        @click="onViewData">
        <v-icon left>mdi-table-eye</v-icon> View Data
      </v-btn>
    </v-alert>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

const SELECTABLE_LAYERS = [
  'counts',
  'intersections',
  'midblocks',
];

export default {
  name: 'PaneMapPopup',
  props: {
    feature: Object,
    hover: Boolean,
  },
  computed: {
    centrelineId() {
      if (this.layerId === 'intersections') {
        return this.feature.properties.int_id;
      }
      if (this.layerId === 'counts') {
        return this.feature.properties.centrelineId;
      }
      if (this.layerId === 'midblocks') {
        return this.feature.properties.geo_id;
      }
      return null;
    },
    centrelineType() {
      if (this.layerId === 'intersections') {
        return CentrelineType.INTERSECTION;
      }
      if (this.layerId === 'counts') {
        return this.feature.properties.centrelineType;
      }
      if (this.layerId === 'midblocks') {
        return CentrelineType.SEGMENT;
      }
      return null;
    },
    color() {
      return this.hover ? 'warning' : 'success';
    },
    coordinates() {
      const { coordinates } = this.feature.geometry;
      if (this.layerId === 'midblocks') {
        return getLineStringMidpoint(coordinates);
      }
      return coordinates;
    },
    description() {
      if (this.layerId === 'collisionsLevel2' || this.layerId === 'collisionsLevel1') {
        const { accdate, acctime, injury } = this.feature.properties;
        let dt;
        if (this.layerId === 'collisionsLevel2') {
          dt = DateTime.fromISO(accdate);
        } else {
          dt = DateTime.fromJSON(accdate);
        }

        const hhmm = parseInt(acctime, 10);
        const hour = Math.floor(hhmm / 100);
        const minute = hhmm % 100;
        dt = dt.set({ hour, minute });
        const dtStr = TimeFormatters.formatDateTime(dt);

        if (injury === 4) {
          return `${dtStr}: Fatal`;
        }
        if (injury === 3) {
          return `${dtStr}: Serious Injury`;
        }
        return dtStr;
      }
      if (this.layerId === 'counts') {
        const { numArteryCodes } = this.feature.properties;
        if (numArteryCodes === 1) {
          return '1 count station';
        }
        return `${numArteryCodes} count stations`;
      }
      if (this.layerId === 'intersections') {
        const description = this.feature.properties.intersec5;
        if (!description) {
          return description;
        }
        return formatCountLocationDescription(description);
      }
      if (this.layerId === 'midblocks') {
        const description = this.feature.properties.lf_name;
        if (!description) {
          return description;
        }
        return formatCountLocationDescription(description);
      }
      if (this.layerId === 'schoolsLevel2' || this.layerId === 'schoolsLevel1') {
        return this.feature.properties.name;
      }
      return null;
    },
    descriptionFormatted() {
      if (this.description) {
        return formatCountLocationDescription(this.description);
      }
      return null;
    },
    featureCode() {
      if (this.layerId === 'intersections') {
        return this.feature.properties.elevatio9;
      }
      if (this.layerId === 'midblocks') {
        return this.feature.properties.fcode;
      }
      /*
       * In this case, we don't have a reliable feature code we can use.  Eventually, we should
       * change `CountDAO` to provide this when returning counts.
       */
      return null;
    },
    featureSelectable() {
      return SELECTABLE_LAYERS.includes(this.layerId);
    },
    icon() {
      if (this.layerId === 'collisionsLevel2' || this.layerId === 'collisionsLevel1') {
        return 'mdi-car-brake-alert';
      }
      if (this.layerId === 'counts') {
        return this.hover ? 'mdi-format-list-numbered' : 'mdi-map-marker';
      }
      if (this.layerId === 'schoolsLevel2' || this.layerId === 'schoolsLevel1') {
        const { schoolType } = this.feature.properties;
        if (schoolType === 'U' || schoolType === 'C') {
          return 'mdi-school';
        }
        return 'mdi-teach';
      }
      return this.hover ? 'mdi-road-variant' : 'mdi-map-marker';
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
  position: absolute;
  right: var(--space-l);
  top: var(--space-m);
  width: var(--space-4xl);
  z-index: var(--z-index-controls);
}
</style>
