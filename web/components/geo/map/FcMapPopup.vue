<template>
  <div class="d-none">
    <v-card ref="content" min-width="220">
      <v-card-title class="shading">
        <h2 class="display-1">{{title}}</h2>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="default--text">
        <FcProgressLinear
          v-if="loading"
          aria-label="Loading feature details" />
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

import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import { getFeatureDetails, getFeatureDetailsSuffix } from '@/lib/geo/map/PopupDetails';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcPopupDetailsCollision from '@/web/components/geo/map/FcPopupDetailsCollision.vue';
import FcPopupDetailsHospital from '@/web/components/geo/map/FcPopupDetailsHospital.vue';
import FcPopupDetailsLocation from '@/web/components/geo/map/FcPopupDetailsLocation.vue';
import FcPopupDetailsSchool from '@/web/components/geo/map/FcPopupDetailsSchool.vue';
import FcPopupDetailsStudy from '@/web/components/geo/map/FcPopupDetailsStudy.vue';
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
    FcPopupDetailsStudyRequest,
    FcProgressLinear,
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
      if (this.layerId === 'locations-markers' && this.feature.properties.studyType) {
        return this.feature.properties.description;
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
      this.loading = true;
      this.featureDetails = await getFeatureDetails(this.layerId, this.feature);
      this.loading = false;
    },
  },
};
</script>

<style lang="scss">
.fc-map-popup {
  z-index: calc(var(--z-index-controls) - 1);
  &.hovered {
    z-index: calc(var(--z-index-controls) - 2);
  }
  .mapboxgl-popup-content {
    pointer-events: none;
  }
  .v-card__actions{
    pointer-events: none;
  }
  .fc-button {
    pointer-events: all !important;
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
