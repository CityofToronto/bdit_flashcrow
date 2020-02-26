<template>
  <v-card width="220">
    <v-card-title>
      <div class="display-1">{{title}}</div>
      <v-spacer></v-spacer>
      <v-icon v-if="icon">{{icon}}</v-icon>
    </v-card-title>
    <v-card-text>
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <template v-else>
        <div
          v-for="(line, i) in description"
          :key="i"
          class="body-1">
          {{line}}
        </div>
      </template>
    </v-card-text>
    <v-card-actions v-if="!loading && featureSelectable">
      <FcButton
        type="tertiary"
        @click="actionViewData">
        View Data
      </FcButton>
    </v-card-actions>
  </v-card>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcButton from '@/web/components/inputs/FcButton.vue';

const SELECTABLE_LAYERS = [
  'counts',
  'intersections',
  'midblocks',
];

async function getCollisionDescription(layerId, feature) {
  const { accdate, acctime } = feature.properties;
  let dt;
  if (layerId === 'collisionsLevel2') {
    dt = DateTime.fromISO(accdate);
  } else {
    dt = DateTime.fromJSON(accdate);
  }

  const hhmm = parseInt(acctime, 10);
  const hour = Math.floor(hhmm / 100);
  const minute = hhmm % 100;
  dt = dt.set({ hour, minute });
  const dtStr = TimeFormatters.formatDateTime(dt);
  return [dtStr];
}

async function getCountDescription(/* layerId, feature */) {
  return [];
}

async function getIntersectionDescription(layerId, feature) {
  let description = feature.properties.intersec5;
  if (description) {
    description = formatCountLocationDescription(description);
  }
  return [description];
}

async function getMidblockDescription(layerId, feature) {
  let description = feature.properties.lf_name;
  if (description) {
    description = formatCountLocationDescription(description);
  }
  return [description];
}

async function getSchoolDescription(layerId, feature) {
  return [feature.properties.name];
}

async function getFeatureDescription(layerId, feature) {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return getCollisionDescription(layerId, feature);
  }
  if (layerId === 'counts') {
    return getCountDescription(layerId, feature);
  }
  if (layerId === 'intersections') {
    return getIntersectionDescription(layerId, feature);
  }
  if (layerId === 'midblocks') {
    return getMidblockDescription(layerId, feature);
  }
  if (layerId === 'schoolsLevel2' || layerId === 'schoolsLevel1') {
    return getSchoolDescription(layerId, feature);
  }
  return [];
}

export default {
  name: 'PaneMapPopup',
  components: {
    FcButton,
  },
  props: {
    feature: Object,
  },
  inject: {
    map: {
      default: null,
    },
  },
  data() {
    return {
      description: [],
      loading: true,
    };
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
      return getGeometryMidpoint(this.feature.geometry);
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
    featureKey() {
      const { layerId } = this;
      const { id } = this.feature.properties.id;
      return `${layerId}:${id}`;
    },
    featureSelectable() {
      return SELECTABLE_LAYERS.includes(this.layerId);
    },
    icon() {
      if (this.layerId === 'collisionsLevel2' || this.layerId === 'collisionsLevel1') {
        // TODO: determine if pedestrian, cyclist, etc. was involved
        // pedestrian: 'mdi-walk'
        // cyclist: 'mdi-bike'
        return null;
      }
      if (this.layerId === 'schoolsLevel2' || this.layerId === 'schoolsLevel1') {
        const { schoolType } = this.feature.properties;
        if (schoolType === 'U' || schoolType === 'C') {
          return 'mdi-school';
        }
        return 'mdi-teach';
      }
      return null;
    },
    layerId() {
      return this.feature.layer.id;
    },
    title() {
      if (this.layerId === 'collisionsLevel2' || this.layerId === 'collisionsLevel1') {
        const { injury } = this.feature.properties;
        if (injury === 4) {
          return 'Fatality';
        }
        if (injury === 3) {
          return 'Serious Injury';
        }
        return 'Collision';
      }
      if (this.layerId === 'counts') {
        const { numArteryCodes } = this.feature.properties;
        if (numArteryCodes === 1) {
          return '1 Station';
        }
        return `${numArteryCodes} Stations`;
      }
      if (this.layerId === 'intersections') {
        return 'Intersection';
      }
      if (this.layerId === 'midblocks') {
        return 'Midblock';
      }
      if (this.layerId === 'schoolsLevel2' || this.layerId === 'schoolsLevel1') {
        const { schoolType } = this.feature.properties;
        if (schoolType === 'U') {
          return 'University';
        }
        if (schoolType === 'C') {
          return 'College';
        }
        return 'School';
      }
      return null;
    },
  },
  watch: {
    coordinates() {
      this.popup.setLngLat(this.coordinates);
    },
    featureKey: {
      handler() {
        this.loadAsyncForFeature();
      },
      immediate: true,
    },
  },
  created() {
    this.popup = new mapboxgl.Popup({
      className: 'fc-pane-map-popup elevation-2',
      closeButton: false,
      closeOnClick: false,
      offset: 40,
    });
    this.popup.setLngLat(this.coordinates);
  },
  mounted() {
    this.popup.setDOMContent(this.$el);
    this.popup.addTo(this.map);
  },
  beforeDestroy() {
    this.popup.remove();
  },
  methods: {
    actionViewData() {
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
    async loadAsyncForFeature() {
      this.loading = true;
      this.description = await getFeatureDescription(this.layerId, this.feature);
      this.loading = false;
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-pane-map-popup {
  & > .mapboxgl-popup-tip {
    display: none;
  }
  & > .mapboxgl-popup-content {
    padding: 0;
  }
}
</style>
