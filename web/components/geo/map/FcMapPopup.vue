<template>
  <div class="d-none">
    <v-card ref="content" min-width="220">
      <v-card-title class="shading flex-column d-flex align-start">
        <h2 class="display-1">{{title}}</h2>
        <h4 v-if="this.feature.properties.studyRequests"
        class="display-2 body-2 text-subtitle-2
        mt-1">{{ this.feature.properties.description }}</h4>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="default--text"
      :class="this.feature.properties.studyRequests ? 'px-0' : ''">
        <FcProgressLinear
          v-if="loading"
          aria-label="Loading feature details" />
        <p v-else-if="error">
          <component
          :is="'FcPopupDetails' + 'Error'"
          />
        </p>
        <component
          v-else
          :is="'FcPopupDetails' + detailsSuffix"
          :feature-details="featureDetails" />
      </v-card-text>

      <template v-if="featureSelectable && !loading">
        <slot name="action" v-bind="feature" />
      </template>
    </v-card>
  </div>
</template>

<script>
import maplibregl from 'maplibre-gl/dist/maplibre-gl';
import { mapMutations } from 'vuex';

import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import { getFeatureDetails, getFeatureDetailsSuffix } from '@/lib/geo/map/PopupDetails';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcPopupDetailsCollision from '@/web/components/geo/map/FcPopupDetailsCollision.vue';
import FcPopupDetailsHospital from '@/web/components/geo/map/FcPopupDetailsHospital.vue';
import FcPopupDetailsLocation from '@/web/components/geo/map/FcPopupDetailsLocation.vue';
import FcPopupDetailsSchool from '@/web/components/geo/map/FcPopupDetailsSchool.vue';
import FcPopupDetailsStudy from '@/web/components/geo/map/FcPopupDetailsStudy.vue';
import FcPopupDetailsError from '@/web/components/geo/map/FcPopupDetailsError.vue';
import FcPopupDetailsStudyRequest from '@/web/components/geo/map/FcPopupDetailsStudyRequest.vue';

const SELECTABLE_LAYERS = [
  'studies',
  'intersections',
  'midblocks',
];

export default {
  name: 'FcMapPopup',
  components: {
    FcPopupDetailsCollision,
    FcPopupDetailsHospital,
    FcPopupDetailsLocation,
    FcPopupDetailsSchool,
    FcPopupDetailsStudy,
    FcProgressLinear,
    FcPopupDetailsError,
    FcPopupDetailsStudyRequest,
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
      error: false,
    };
  },
  computed: {
    coordinates() {
      return getGeometryMidpoint(this.feature.geometry);
    },
    detailsSuffix() {
      return getFeatureDetailsSuffix(this.layerId);
    },
    featureKey() {
      const { layerId, feature: { id } } = this;
      return `${layerId}:${id}`;
    },
    featureSelectable() {
      return SELECTABLE_LAYERS.includes(this.feature.layer.id);
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
        return 'Study Location';
      }
      if (this.layerId === 'locations-markers') {
        const studyRequests = JSON.parse(this.feature.properties.studyRequests);
        const numRequests = studyRequests.length;
        return (numRequests > 1 ? `${numRequests} ` : '').concat('Study Request').concat(numRequests > 1 ? 's' : '');
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
      deep: true,
    },
  },
  created() {
    this.createPopup();
  },
  mounted() {
    this.popup.setLngLat(this.coordinates);
    this.popup.setDOMContent(this.$refs.content.$el);
    this.popup.addTo(this.map);
  },
  beforeDestroy() {
    this.popup.remove();
  },
  methods: {
    createPopup() {
      const hoveredClassName = this.hovered ? ' hovered' : '';
      const offset = this.hovered ? 0 : 40;
      this.popup = new maplibregl.Popup({
        anchor: 'bottom',
        className: `fc-map-popup elevation-2${hoveredClassName}`,
        closeButton: false,
        closeOnClick: false,
        offset,
      });
    },
    async loadAsyncForFeature() {
      this.error = false;
      this.loading = true;
      try {
        this.featureDetails = await getFeatureDetails(this.layerId, this.feature);
      } catch (err) {
        this.error = true;
        this.setToastEnrichedError('<span>Tooltip failed to load. Email the <a style="color:white; font-weight:bold" href="mailto:move-team@toronto.ca">MOVE team</a> for assistance.</span>');
      }
      this.loading = false;
    },
    ...mapMutations(['setToastEnrichedError']),
  },
};
</script>

<style lang="scss">
.fc-map-popup {
  z-index: calc(var(--z-index-controls) - 1);
  &.hovered {
    z-index: calc(var(--z-index-controls) - 2);
  }

  /*
   * MapboxGL style overrides.
   */
  & > .mapboxgl-popup-tip {
    display: none;
  }
  & > .mapboxgl-popup-content {
    padding: 0;
  }
}
</style>
