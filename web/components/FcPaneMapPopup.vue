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
          :disabled="disabledActionSelected"
          @click="actionSelected">
          {{textActionSelected}}
        </FcButton>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import { mapMutations, mapState } from 'vuex';

import { CentrelineType, LocationMode, MAX_LOCATIONS } from '@/lib/Constants';
import { formatCountLocationDescription } from '@/lib/StringFormatters';
import {
  getCollisionByCollisionId,
  getLocationByCentreline,
  getStudiesByCentrelineSummary,
} from '@/lib/api/WebApi';
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';
import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import CompositeId from '@/lib/io/CompositeId';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcButton from '@/web/components/inputs/FcButton.vue';

const SELECTABLE_LAYERS = [
  'studies',
  'intersections',
  'midblocks',
];

async function getCollisionDetails(feature) {
  const { id: collisionId } = feature;
  return getCollisionByCollisionId(collisionId);
}

function getCollisionDescription(feature, collision) {
  const description = [];
  if (collision === null) {
    return description;
  }

  collision.involved.forEach(({ invtype, invage }) => {
    const invageRange = `${invage} to ${invage + 4}`;
    if (invtype === 3) {
      description.push(`Pedestrian \u00b7 ${invageRange}`);
    } else if (invtype === 4) {
      description.push(`Cyclist \u00b7 ${invageRange}`);
    }
  });

  const { accdate } = collision;
  const accdateStr = TimeFormatters.formatDateTime(accdate);
  description.push(accdateStr);

  let { street1, street2 } = collision;
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

async function getCentrelineDetails(feature, centrelineType) {
  const { centrelineId } = feature.properties;
  const location = await getLocationByCentreline({ centrelineId, centrelineType });
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

  const { centrelineType } = feature.properties;
  if (centrelineType === CentrelineType.SEGMENT) {
    let { aadt = null } = feature.properties;
    if (aadt !== null) {
      aadt = 100 * Math.round(aadt / 100);
      aadt = `AADT (est. 2018): ${aadt}`;
      description.push(aadt);
    }
  }

  return description;
}

async function getHospitalDetails() {
  return null;
}

function getHospitalDescription(feature) {
  return [feature.properties.name];
}

function getHospitalIcon() {
  return 'mdi-hospital-box';
}

async function getSchoolDetails() {
  return null;
}

function getSchoolDescription(feature) {
  return [feature.properties.name];
}

function getSchoolIcon() {
  return 'mdi-school';
}

async function getStudyDetails(feature) {
  const { centrelineId, centrelineType } = feature.properties;
  const tasks = [
    getLocationByCentreline({ centrelineId, centrelineType }),
    getStudiesByCentrelineSummary([{ centrelineId, centrelineType }], {}),
  ];
  const [location, studySummary] = await Promise.all(tasks);
  return { location, studySummary };
}

function getStudyDescription(feature, { location, studySummary }) {
  const description = [];

  studySummary.forEach(({ category: { studyType }, mostRecent }) => {
    let label = 'Unknown';
    if (studyType !== null) {
      label = studyType.label;
    }
    const { startDate } = mostRecent;
    const startDateStr = TimeFormatters.formatDefault(startDate);
    const studyStr = `${label} (${startDateStr})`;
    description.push(studyStr);
  });

  const locationFeatureType = getLocationFeatureType(location);
  if (locationFeatureType !== null) {
    const locationStr = `${locationFeatureType.description} \u00b7 ${location.description}`;
    description.push(locationStr);
  }

  return description;
}

async function getFeatureDetailsImpl(layerId, feature) {
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return getCollisionDetails(feature);
  }
  if (layerId === 'hospitalsLevel2' || layerId === 'hospitalsLevel1') {
    return getHospitalDetails(feature);
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
  if (layerId === 'studies') {
    return getStudyDetails(feature);
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
  if (layerId === 'hospitalsLevel2' || layerId === 'hospitalsLevel1') {
    return getHospitalDescription(feature, details);
  }
  if (layerId === 'intersections' || layerId === 'midblocks') {
    return getCentrelineDescription(feature, details);
  }
  if (layerId === 'schoolsLevel2' || layerId === 'schoolsLevel1') {
    return getSchoolDescription(feature, details);
  }
  if (layerId === 'studies') {
    return getStudyDescription(feature, details);
  }
  return [];
}

function getFeatureIcon({ layerId, feature, details }) {
  if (layerId === 'collisionsLevel2' || layerId === 'collisionsLevel1') {
    return getCollisionIcon(feature, details);
  }
  if (layerId === 'hospitalsLevel2' || layerId === 'hospitalsLevel1') {
    return getHospitalIcon(feature, details);
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
    disabledActionSelected() {
      const { name } = this.$route;
      if (name === 'requestStudyEdit' || name === 'requestStudyNew') {
        return false;
      }
      if (this.locationMode === LocationMode.MULTI_EDIT) {
        if (this.featureLocationsEditIndex !== -1) {
          return false;
        }
        return this.locationsEditIndex === -1 && this.locationsEdit.length >= MAX_LOCATIONS;
      }
      return false;
    },
    featureKey() {
      const { layerId, feature: { id } } = this;
      return `${layerId}:${id}`;
    },
    featureLocationsEditIndex() {
      if (!this.featureSelectable) {
        return false;
      }
      const { centrelineId, centrelineType } = this.feature.properties;
      return this.locationsEdit.findIndex(
        location => location.centrelineType === centrelineType
          && location.centrelineId === centrelineId,
      );
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
    textActionSelected() {
      const { name } = this.$route;
      if (name === 'requestStudyEdit' || name === 'requestStudyNew') {
        return 'Set Study Location';
      }
      if (this.locationMode === LocationMode.MULTI_EDIT) {
        if (this.featureLocationsEditIndex !== -1) {
          return `Remove Location #${this.featureLocationsEditIndex + 1}`;
        }
        if (this.locationsEditIndex === -1) {
          return 'Add Location';
        }
        return `Set Location #${this.locationsEditIndex + 1}`;
      }
      return 'View Data';
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
      if (this.layerId === 'hospitalsLevel2' || this.layerId === 'hospitalsLevel1') {
        return 'Hospital';
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
      if (this.layerId === 'studies') {
        const { numArteryCodes } = this.feature.properties;
        if (numArteryCodes === 1) {
          return '1 Study Location';
        }
        return `${numArteryCodes} Study Locations`;
      }
      return null;
    },
    ...mapState(['locationsEditIndex', 'locationMode', 'locationsEdit']),
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
    actionRemoveLocationEdit() {
      this.removeLocationEdit(this.featureLocationsEditIndex);
    },
    actionSelected() {
      const { name } = this.$route;
      if (name === 'requestStudyEdit' || name === 'requestStudyNew') {
        this.actionSetStudyLocation();
      } else if (this.locationMode === LocationMode.MULTI_EDIT) {
        if (this.featureLocationsEditIndex !== -1) {
          this.actionRemoveLocationEdit();
        } else {
          this.actionSetLocationEdit();
        }
      } else {
        this.actionViewData();
      }
    },
    async actionSetLocationEdit() {
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);
      this.setLocationEdit(location);
    },
    async actionSetStudyLocation() {
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);
      this.setLocations([location]);
    },
    actionViewData() {
      if (this.$route.name === 'viewDataAtLocation') {
        this.setDrawerOpen(true);
      }

      // open the view data window
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const s1 = CompositeId.encode([feature]);
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { s1 },
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
    ...mapMutations([
      'removeLocationEdit',
      'setDrawerOpen',
      'setLocationEdit',
      'setLocations',
    ]),
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
