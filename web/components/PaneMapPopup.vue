<template>
  <div class="pane-map-popup">
    <TdsPanel
      :icon="icon"
      :variant="variant">
      <div class="font-size-m ml-l pl-m">
        <strong v-if="description">{{description}}</strong>
        <span v-else> name unknown</span>
      </div>
      <template v-if="featureSelectable">
        <button
          class="font-size-l mt-s uppercase"
          @click="onViewData">
          <i class="fa fa-eye"></i>
          <span> View Data</span>
        </button>
      </template>
    </TdsPanel>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import TdsPanel from '@/web/components/tds/TdsPanel.vue';

const SELECTABLE_LAYERS = [
  'counts',
  'intersections',
  'midblocks',
];

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
        return 'car-crash';
      }
      if (this.layerId === 'counts') {
        return this.hover ? 'list-ol' : 'map-marker-alt';
      }
      if (this.layerId === 'schoolsLevel2' || this.layerId === 'schoolsLevel1') {
        const { schoolType } = this.feature.properties;
        if (schoolType === 'U' || schoolType === 'C') {
          return 'graduation-cap';
        }
        return 'school';
      }
      return this.hover ? 'road' : 'map-marker-alt';
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

  font-family: var(--font-family);
  left: var(--space-l);
  position: absolute;
  top: var(--space-m);
  width: var(--space-4xl);
  z-index: var(--z-index-controls);
}
</style>
