<template>
  <div class="d-none">
    <v-card ref="content" min-width="220">
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
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import {
  getCollisionPopupDetails,
  getCountsByCentrelineSummary,
  getLocationByFeature,
} from '@/lib/api/WebApi';
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';
import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcButton from '@/web/components/inputs/FcButton.vue';

const SELECTABLE_LAYERS = [
  'counts',
  'intersections',
  'midblocks',
];

async function getCollisionDetails(feature) {
  const { id } = feature;
  return getCollisionPopupDetails(id);
}

function getCollisionDescription(feature, { event, involved }) {
  const description = [];
  if (event === null) {
    return description;
  }

  involved.forEach(({ invtype, invage }) => {
    const invageRange = `${invage} to ${invage + 4}`;
    if (invtype === 3) {
      description.push(`Pedestrian \u00b7 ${invageRange}`);
    } else if (invtype === 4) {
      description.push(`Cyclist \u00b7 ${invageRange}`);
    }
  });

  const { dateTime } = event;
  const dateTimeStr = TimeFormatters.formatDateTime(dateTime);
  description.push(dateTimeStr);

  let { street1, street2 } = event;
  if (street1 !== null) {
    street1 = formatCountLocationDescription(street1);
    if (street2 !== null) {
      street2 = formatCountLocationDescription(street2);
      description.push(`${street1} and ${street2}`);
    } else {
      description.push(street1);
    }
  }

  return description;
}

function getCollisionIcon(feature, { involved }) {
  const n = involved.length;
  for (let i = 0; i < n; i++) {
    const { invtype } = involved[i];
    if (invtype === 3) {
      return 'mdi-walk';
    }
    if (invtype === 4) {
      return 'mdi-bike';
    }
  }
  return null;
}

async function getCountDetails(feature) {
  const { centrelineId, centrelineType } = feature.properties;
  // TODO: incorporate date range
  const tasks = [
    getCountsByCentrelineSummary({ centrelineId, centrelineType }, {}),
    getLocationByFeature({ centrelineId, centrelineType }),
  ];
  const [countSummary, location] = await Promise.all(tasks);
  return { countSummary, location };
}

function getCountDescription(feature, { countSummary, location }) {
  const description = [];

  countSummary.forEach(({ count }) => {
    const { label } = count.type.studyType;
    const { date } = count;
    const dateStr = TimeFormatters.formatDefault(date);
    const countStr = `${label} (${dateStr})`;
    description.push(countStr);
  });

  const locationFeatureType = getLocationFeatureType(location);
  if (locationFeatureType !== null) {
    const locationStr = `${locationFeatureType.description} \u00b7 ${location.description}`;
    description.push(locationStr);
  }

  return description;
}

async function getCentrelineDetails(feature, centrelineType) {
  const { centrelineId } = feature.properties;
  const location = await getLocationByFeature({ centrelineId, centrelineType });
  return { location };
}

function getCentrelineDescription(feature, { location }) {
  const description = [];

  let { name } = feature.properties;
  if (name) {
    name = formatCountLocationDescription(name);
  }
  description.push(name);

  const locationFeatureType = getLocationFeatureType(location);
  if (locationFeatureType !== null) {
    description.push(locationFeatureType.description);
  }

  return description;
}

async function getSchoolDetails() {
  return null;
}

function getSchoolDescription(feature) {
  return [feature.properties.name];
}

function getSchoolIcon(feature) {
  const { schoolType } = feature.properties;
  if (schoolType === 'U' || schoolType === 'C') {
    return 'mdi-school';
  }
  return 'mdi-teach';
}

async function getFeatureDetailsImpl(layerId, feature) {
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return getCollisionDetails(feature);
  }
  if (layerId === 'counts') {
    return getCountDetails(feature);
  }
  if (layerId === 'intersections') {
    return getCentrelineDetails(feature, CentrelineType.INTERSECTION);
  }
  if (layerId === 'midblocks') {
    return getCentrelineDetails(feature, CentrelineType.SEGMENT);
  }
  if (layerId === 'schoolsLevel2' || layerId === 'schoolsLevel1') {
    return getSchoolDetails(feature);
  }
  return null;
}

async function getFeatureDetails(layerId, feature) {
  const details = await getFeatureDetailsImpl(layerId, feature);
  return { layerId, feature, details };
}

function getFeatureDescription({ layerId, feature, details }) {
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return getCollisionDescription(feature, details);
  }
  if (layerId === 'counts') {
    return getCountDescription(feature, details);
  }
  if (layerId === 'intersections' || layerId === 'midblocks') {
    return getCentrelineDescription(feature, details);
  }
  if (layerId === 'schoolsLevel2' || layerId === 'schoolsLevel1') {
    return getSchoolDescription(feature, details);
  }
  return [];
}

function getFeatureIcon({ layerId, feature, details }) {
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return getCollisionIcon(feature, details);
  }
  if (layerId === 'schoolsLevel2' || layerId === 'schoolsLevel1') {
    return getSchoolIcon(feature, details);
  }
  return null;
}


export default {
  name: 'PaneMapPopup',
  components: {
    FcButton,
  },
  props: {
    feature: Object,
    hovered: Boolean,
  },
  inject: {
    map: {
      default: null,
    },
  },
  data() {
    return {
      featureDetails: null,
      loading: true,
    };
  },
  computed: {
    coordinates() {
      return getGeometryMidpoint(this.feature.geometry);
    },
    description() {
      if (this.loading || this.featureDetails === null) {
        return [];
      }
      return getFeatureDescription(this.featureDetails);
    },
    featureKey() {
      const { layerId, feature: { id } } = this;
      return `${layerId}:${id}`;
    },
    featureSelectable() {
      return SELECTABLE_LAYERS.includes(this.layerId);
    },
    icon() {
      if (this.loading || this.featureDetails === null) {
        return null;
      }
      return getFeatureIcon(this.featureDetails);
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
    this.createPopup();
  },
  mounted() {
    this.createPopup();
    this.popup.setLngLat(this.coordinates);
    this.popup.setDOMContent(this.$refs.content.$el);
    this.popup.addTo(this.map);
  },
  beforeDestroy() {
    this.popup.remove();
  },
  methods: {
    async actionViewData() {
      // update location
      const { centrelineId, centrelineType } = this.feature.properties;
      const location = await getLocationByFeature({ centrelineId, centrelineType });
      this.setLocation(location);

      // open the view data window
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      });
    },
    createPopup() {
      const hoveredClassName = this.hovered ? ' hovered' : '';
      const offset = this.hovered ? 0 : 40;
      this.popup = new mapboxgl.Popup({
        anchor: 'bottom',
        className: `fc-pane-map-popup elevation-2${hoveredClassName}`,
        closeButton: false,
        closeOnClick: false,
        offset,
      });
    },
    async loadAsyncForFeature() {
      this.loading = true;
      this.featureDetails = await getFeatureDetails(this.layerId, this.feature);
      this.loading = false;
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-pane-map-popup {
  z-index: calc(var(--z-index-controls) - 1);
  &.hovered {
    z-index: calc(var(--z-index-controls) - 2);
  }
  & > .mapboxgl-popup-tip {
    display: none;
  }
  & > .mapboxgl-popup-content {
    padding: 0;
  }
}
</style>
