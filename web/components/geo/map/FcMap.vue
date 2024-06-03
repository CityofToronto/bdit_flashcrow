<template>
  <div
    class="fc-map"
    @mouseleave="setHoveredFeature(null)">
    <div class="fc-map-controls fc-map-progress">
      <FcProgressLinear
        v-if="loading"
        aria-label="Loading map layers and data"
        silent />
    </div>

    <div class="fc-map-controls fc-half-width">
      <slot name="top-left" />
    </div>
    <div class="fc-map-controls top-left-two">
      <slot name="top-left-two" />
    </div>

    <div class="fc-map-controls fc-map-mode">
      <p
      v-if="frontendEnv === FrontendEnv.LOCAL || frontendEnv === FrontendEnv.DEV">
        Zoom level: {{ zoomLevel.toFixed(2) }}
    </p>
      <FcButton
        class="mr-2"
        type="fab-text"
        @click="actionOpenGoogleMaps">
        <v-icon
          :aria-hidden="false"
          aria-label="Opens in a new window"
          left>
          mdi-open-in-new
        </v-icon>
        <span class="sr-only">Google</span>
        Street View
      </FcButton>
      <FcButton
        type="fab-text"
        @click="actionToggleAerial">
        {{ aerial ? 'Map' : 'Aerial' }}
      </FcButton>
    </div>

    <div class="fc-map-controls fc-map-legend-wrapper">
      <FcMapLegend
        v-if="showLegend"
        v-model="internalLayers" />
    </div>

    <div class="fc-map-controls fc-map-navigate">
      <slot name="action-navigate" />
      <FcButtonAria
        v-if="locationsState.length > 0"
        aria-label="Recenter location"
        class="pa-0"
        left
        type="fab-text"
        @click="actionRecenterLocation">
        <v-icon class="display-2">mdi-map-marker-circle</v-icon>
      </FcButtonAria>
    </div>

    <FcMapPopup
      v-if="showHoveredPopup"
      :key="'h:' + featureKeyHovered"
      :feature="hoveredFeature"
      :hovered="true">
      <template v-slot:action="feature">
        <slot name="action-popup" v-bind="feature" />
      </template>
    </FcMapPopup>
    <FcMapPopup
      v-if="showSelectedPopup"
      :key="'s:' + featureKeySelected"
      :feature="selectedFeature"
      :hovered="false">
      <template v-slot:action="feature">
        <slot name="action-popup" v-bind="feature" />
      </template>
    </FcMapPopup>
  </div>
</template>

<script>
import maplibregl from 'maplibre-gl/dist/maplibre-gl';
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';

import { CentrelineType, MapZoom } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import {
  defaultCollisionFilters,
  defaultCommonFilters,
  defaultStudyFilters,
} from '@/lib/filters/DefaultFilters';
import GeoStyle from '@/lib/geo/GeoStyle';
import { BOUNDS_TORONTO, makeMaplibreGlMap } from '@/lib/geo/map/MaplibreGlBase';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcMapLegend from '@/web/components/geo/legend/FcMapLegend.vue';
import FcMapPopup from '@/web/components/geo/map/FcMapPopup.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FrontendEnv from '@/web/config/FrontendEnv';

function getFeatureKey(feature) {
  if (feature === null) {
    return null;
  }
  const { layer: { id: layerId }, id } = feature;
  if (layerId === 'intersections' || layerId === 'midblocks' || layerId === 'studies') {
    const { centrelineType, centrelineId } = feature.properties;
    return `c:${centrelineType}:${centrelineId}`;
  }
  return `${layerId}:${id}`;
}

function getFeatureKeyLocation(location) {
  if (location === null) {
    return null;
  }
  const { centrelineType, centrelineId } = location;
  return `c:${centrelineType}:${centrelineId}`;
}

export default {
  name: 'FcMap',
  components: {
    FcButton,
    FcButtonAria,
    FcMapLegend,
    FcMapPopup,
    FcProgressLinear,
  },
  provide() {
    const self = this;
    return {
      get map() {
        return self.map;
      },
    };
  },
  props: {
    filtersCollision: {
      type: Object,
      default() { return defaultCollisionFilters(); },
    },
    filtersCommon: {
      type: Object,
      default() { return defaultCommonFilters(); },
    },
    filtersStudy: {
      type: Object,
      default() { return defaultStudyFilters(); },
    },
    layers: {
      type: Object,
      default() {
        return {
          collisions: false,
          hospitals: false,
          schools: false,
          studies: false,
          volume: false,
        };
      },
    },
    locationActive: {
      type: Object,
      default() { return null; },
    },
    locationsState: {
      type: Array,
      default() { return []; },
    },
    hoverLayerState: {
      type: Number,
      default: null,
    },
    showLegend: {
      type: Boolean,
      default: true,
    },
    easeToLocationMode: {
      type: String,
      validator: value => ['all', 'single', 'none'].includes(value),
      default: 'all',
    },
    isRequestPage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      aerial: false,
      coordinates: null,
      loading: false,
      // used to add slight debounce delay (200ms) to hovered popup
      featureKeyHoveredPopup: null,
      // keeps track of which feature we are currently hovering over
      hoveredFeature: null,
      // keeps track of currently selected feature
      selectedFeature: null,
      zoomLevel: 0,
      defaultEaseOpts: {
        center: BOUNDS_TORONTO.getCenter(),
        duration: 1000,
        zoom: MapZoom.LEVEL_3.minzoom,
      },
      FrontendEnv,
    };
  },
  computed: {
    centrelineActiveFeatures() {
      const features = [];
      if (this.centrelineHovered) {
        const { properties: { centrelineId, centrelineType } } = this.hoveredFeature;
        features.push({ centrelineId, centrelineType });
      }
      if (this.centrelineSelected) {
        const { properties: { centrelineId, centrelineType } } = this.selectedFeature;
        features.push({ centrelineId, centrelineType });
      }
      return features;
    },
    centrelineActiveIntersections() {
      return this.centrelineActiveFeatures.filter(
        ({ centrelineType }) => centrelineType === CentrelineType.INTERSECTION,
      ).map(({ centrelineId }) => centrelineId);
    },
    centrelineActiveMidblocks() {
      return this.centrelineActiveFeatures.filter(
        ({ centrelineType }) => centrelineType === CentrelineType.SEGMENT,
      ).map(({ centrelineId }) => centrelineId);
    },
    centrelineHovered() {
      if (this.hoveredFeature === null) {
        return false;
      }
      const { layer: { id: layerId } } = this.hoveredFeature;
      return layerId === 'intersections' || layerId === 'midblocks';
    },
    centrelineSelected() {
      if (this.selectedFeature === null) {
        return false;
      }
      const { layer: { id: layerId } } = this.selectedFeature;
      return layerId === 'intersections' || layerId === 'midblocks';
    },
    featureKeyHovered() {
      return getFeatureKey(this.hoveredFeature);
    },
    featureKeySelected() {
      return getFeatureKey(this.selectedFeature);
    },
    internalLayers: {
      get() {
        return this.layers;
      },
      set(layers) {
        this.$emit('update:layers', layers);
      },
    },
    hoverGeoJson() {
      const features = [];

      if (this.hoverLayerState !== null) {
        const { location, state } = this.locationsState[this.hoverLayerState];
        const {
          geom,
          lat,
          lng,
          ...propertiesRest
        } = location;

        const geometry = {
          type: 'Point',
          coordinates: [lng, lat],
        };
        const properties = { ...propertiesRest, ...state };
        const feature = { type: 'Feature', geometry, properties };
        features.push(feature);
      }
      return {
        type: 'FeatureCollection',
        features,
      };
    },
    locationsGeoJson() {
      const features = this.locationsState.map(({ location, state }) => {
        const { geom: geometry, ...propertiesRest } = location;
        const properties = { ...propertiesRest, ...state };
        return { type: 'Feature', geometry, properties };
      });

      return {
        type: 'FeatureCollection',
        features,
      };
    },
    locationsMarkersGeoJson() {
      const features = this.locationsState.map(({ location, state }) => {
        const {
          geom,
          lat,
          lng,
          ...propertiesRest
        } = location;

        const geometry = {
          type: 'Point',
          coordinates: [lng, lat],
        };
        const properties = { ...propertiesRest, ...state };
        return { type: 'Feature', geometry, properties };
      });

      return {
        type: 'FeatureCollection',
        features,
      };
    },
    mapOptions() {
      const {
        aerial,
        filtersCollision,
        filtersCommon,
        filtersStudy,
        internalLayers,
      } = this;
      return {
        aerial,
        filtersCollision,
        filtersCommon,
        filtersStudy,
        layers: internalLayers,
      };
    },
    mapStyle() {
      return GeoStyle.get(this.mapOptions);
    },
    showHoveredPopup() {
      if (this.zoomLevel < (this.isRequestPage ? 7 : 12)) {
        return false;
      }
      if (this.hoveredFeature === null || this.selectedFeature !== null) {
        return false;
      }
      return this.featureKeyHovered !== this.featureKeySelected
        && this.featureKeyHovered === this.featureKeyHoveredPopup;
    },
    showSelectedPopup() {
      if (this.zoomLevel < (this.isRequestPage ? 7 : 12)) {
        return false;
      }
      if (this.selectedFeature === null) {
        return false;
      }
      if (this.$parent.suppressMapPopup === true) {
        this.setSelectedFeature(null);
        return false;
      }
      const featureMatchesRoute = this.featureKeySelected === this.featureKeyRoute;
      if (this.vertical) {
        return !featureMatchesRoute;
      }
      return !this.drawerOpen || !featureMatchesRoute;
    },
    locationMarkersByCentreline() {
      const markersById = {};
      this.locationsMarkersGeoJson.features.forEach(
        // eslint-disable-next-line no-return-assign
        feature => markersById[feature.properties.centrelineId] = feature,
      );
      return markersById;
    },
    locationMarkersByRequestId() {
      const markersById = {};
      this.locationsMarkersGeoJson.features.forEach((feature) => {
        feature.properties.studyRequests.forEach((studyRequest) => {
          markersById[studyRequest.requestId] = feature;
        });
      });
      return markersById;
    },
    ...mapState(['frontendEnv']),
    ...mapState('trackRequests', ['hoveredStudyRequest']),
  },
  created() {
    this.map = null;
  },
  mounted() {
    Vue.nextTick(() => {
      this.loading = false;
      this.map = makeMaplibreGlMap(this.$el, this.mapStyle);

      this.map.on('dataloading', () => {
        this.loading = true;
      });
      this.map.on('idle', () => {
        this.loading = false;
      });
      this.map.on('load', () => {
        this.updateLocationsSource();
        this.updateHoverSource();
        this.updateLocationsMarkersSource();
        if (this.locationsState === 0) {
          this.map.easeTo(this.defaultEaseOpts);
        } else {
          this.easeToLocationbByMode();
        }
        this.map.on('move', this.onMapMove.bind(this));
        this.map.on('click', this.onMapClick.bind(this));
        this.map.on('mousemove', this.onMapMousemove.bind(this));
      });
      this.zoomLevel = this.map.getZoom();
    });
  },
  beforeDestroy() {
    /*
     * If the user navigates to a page that doesn't include `FcMap` between `created()`
     * and `mounted()`, it can happen that `this.map === null`.
     */
    if (this.map !== null) {
      this.map.remove();
    }
  },
  watch: {
    centrelineActiveIntersections() {
      this.map.setFilter(
        'active-intersections',
        ['in', ['get', 'centrelineId'], ['literal', this.centrelineActiveIntersections]],
      );
    },
    centrelineActiveMidblocks() {
      this.map.setFilter(
        'active-midblocksCasing',
        ['in', ['get', 'centrelineId'], ['literal', this.centrelineActiveMidblocks]],
      );
    },
    hoveredFeature: debounce(function watchHoveredFeature() {
      this.featureKeyHoveredPopup = this.featureKeyHovered;
    }, 200),
    locationActive(locationActive, locationActivePrev) {
      if (locationActive === null) {
        const featureKeyLocationActivePrev = getFeatureKeyLocation(locationActivePrev);
        if (this.featureKeySelected === featureKeyLocationActivePrev) {
          this.selectedFeature = null;
        }
        return;
      }
      const { description, geom, ...locationActiveRest } = locationActive;
      const properties = {
        ...locationActiveRest,
        name: description,
      };
      const layerId = properties.centrelineType === CentrelineType.INTERSECTION
        ? 'intersections'
        : 'midblocks';
      this.selectedFeature = {
        geometry: geom,
        layer: { id: layerId },
        properties,
      };
    },
    locationsGeoJson() {
      this.updateLocationsSource();
    },
    hoverGeoJson() {
      this.updateHoverSource();
    },
    locationsMarkersGeoJson() {
      this.updateLocationsMarkersSource();
    },
    locationsState() {
      this.easeToLocationbByMode();
    },
    mapStyle() {
      if (this.map === null) {
        return;
      }
      this.map.setStyle(this.mapStyle);
      this.updateLocationsSource();
      this.updateHoverSource();
      this.updateLocationsMarkersSource();
      this.map.setFilter(
        'active-intersections',
        ['in', ['get', 'centrelineId'], ['literal', this.centrelineActiveIntersections]],
      );
      this.map.setFilter(
        'active-midblocksCasing',
        ['in', ['get', 'centrelineId'], ['literal', this.centrelineActiveMidblocks]],
      );
    },
    hoveredStudyRequest(newValue, oldValue) {
      if (newValue !== null) {
        const feature = this.locationMarkersByRequestId[newValue];
        feature.properties.selected = true;
      }
      if (oldValue !== null) {
        const feature = this.locationMarkersByRequestId[oldValue];
        feature.properties.selected = false;
      }
      this.updateLocationsMarkersSource();
    },
  },
  methods: {
    easeToLocationbByMode() {
      const locations = this.locationsState;
      if (this.easeToLocationMode === 'all') {
        this.easeToLocationsState(locations);
      } else if (this.easeToLocationMode === 'single') {
        this.easeToLocationsState([locations[locations.length - 1]]);
      }
    },
    actionOpenGoogleMaps() {
      if (this.map === null) {
        return;
      }
      const { lat, lng } = this.map.getCenter();
      const zoom = this.map.getZoom();
      const z = Math.round(zoom);
      const url = `https://www.google.com/maps/@${lat},${lng},${z}z`;
      window.open(url, '_blank');
    },
    actionRecenterLocation() {
      if (this.locationsState.length === 0) {
        return;
      }
      this.easeToLocationsState(this.locationsState);
    },
    actionToggleAerial() {
      this.aerial = !this.aerial;
      if (this.aerial) {
        this.setToastInfo('The map is now in Aerial Mode.');
      } else {
        this.setToastInfo('The map is no longer in Aerial Mode.');
      }
    },
    easeToLocationsState(locationsState) {
      if (this.map === null || locationsState.length === 0) {
        return;
      }

      // build bounding box on locations
      const bounds = new maplibregl.LngLatBounds();
      locationsState.forEach(({ location: { geom } }) => {
        const { coordinates, type } = geom;
        if (type === 'Point') {
          bounds.extend(coordinates);
        } else if (type === 'LineString') {
          coordinates.forEach((coordinatesPoint) => {
            bounds.extend(coordinatesPoint);
          });
        }
      });

      // zoom to bounding box
      const boundingBoxPadding = locationsState.length > 1 ? 64 : 0;
      const cameraOptions = this.map.cameraForBounds(bounds, {
        maxZoom: MapZoom.LEVEL_1.minzoom,
        padding: boundingBoxPadding,
      });
      this.map.easeTo(cameraOptions);
    },
    getFeatureForLayerAndProperty(layer, key, value) {
      const features = this.map.queryRenderedFeatures({
        layers: [layer],
        filter: ['==', ['get', key], value],
      });
      if (features.length === 0) {
        return null;
      }
      return features[0];
    },
    /**
     * Fetches the vector tile feature for the given mouse location, usually from a mouse
     * event on the map.
     *
     * For usability, this matching is somewhat fuzzy: it will find the highest-priority
     * feature within a 20x20 bounding box centered on `point`.
     *
     * TODO: within layers, rank by closest to `point` (#982)
     *
     * @param {Object} point - `(x, y)` coordinates of mouse
     * @returns {Object?} the matched feature, or `null` if no such feature
     */
    getFeatureForPoint(point, options) {
      const defaultOptions = {
        selectableOnly: false,
      };
      const featureOptions = {
        ...defaultOptions,
        ...options,
      };
      const { selectableOnly } = featureOptions;

      const layers = [
        'studies',
        'intersections',
        'midblocks',
      ];
      if (!selectableOnly) {
        layers.push(
          'collisionsLevel2',
          'collisionsLevel1',
          'hospitalsLevel2',
          'hospitalsLevel1',
          'schoolsLevel2',
          'schoolsLevel1',
        );
      }
      if (this.isRequestPage) {
        layers.push('locations-markers');
      }

      let features = this.map.queryRenderedFeatures(point, { layers });
      if (features.length > 0) {
        // see if a feature was clicked ... if so choose that one
        // if a feature was not clicked then get features in a bounding box
        return this.pickTooltipFeature(features);
      }
      const { x, y } = point;
      const bbox = [[x - 10, y - 10], [x + 10, y + 10]];
      features = this.map.queryRenderedFeatures(bbox, { layers });
      if (features.length === 0) {
        return null;
      }
      return this.pickTooltipFeature(features);
    },
    pickTooltipFeature(features) {
      if (features.length === 1) {
        return features[0];
      }
      const preference = {
        studies: 3,
        intersections: 2,
        midblocks: 1,
      };
      features.sort((a, b) => {
        const left = preference[a.source] || 0;
        const right = preference[b.source] || 0;
        return right - left;
      });
      return features[0];
    },
    onMapClick(e) {
      const feature = this.getFeatureForPoint(e.point, {
        selectableOnly: true,
      });
      this.setSelectedFeature(feature);
    },
    onMapMove() {
      this.zoomLevel = this.map.getZoom();
    },
    onMapMousemove(e) {
      const feature = this.getFeatureForPoint(e.point);
      this.setHoveredFeature(feature);
    },
    resize() {
      if (this.map !== null) {
        this.map.resize();
      }
    },
    setHoveredFeature(feature) {
      this.hoveredFeature = feature;
    },
    setSelectedFeature(feature) {
      this.selectedFeature = feature;
    },
    updateHoverSource() {
      GeoStyle.setData('hover-markers', this.hoverGeoJson);
      if (this.map !== null) {
        this.map.getSource('hover-markers').setData(this.hoverGeoJson);
      }
    },
    updateLocationsSource() {
      GeoStyle.setData('locations', this.locationsGeoJson);
      if (this.map !== null) {
        this.map.getSource('locations').setData(this.locationsGeoJson);
      }
    },
    updateLocationsMarkersSource() {
      GeoStyle.setData('locations-markers', this.locationsMarkersGeoJson);
      if (this.map !== null) {
        this.map.getSource('locations-markers').setData(this.locationsMarkersGeoJson);
      }
    },
    ...mapMutations(['setToastInfo']),
  },
};
</script>

<style lang="scss">
.fc-map {
  /*
   * This color is shown initially as the map loads.
   */
  background-color: var(--white);

  /*
   * Various controls overlays along the corners / edges of the map.
   */
  & > .fc-map-controls {
    & > p {
      background-color: var(--white);
      width: 60%;
      padding: 5px;
      margin-bottom: 10px;
      text-align: center;
      font: inherit;
    }

    position: absolute;
    z-index: var(--z-index-controls);
  }
  & > .fc-map-progress {
    top: 0;
    width: 100%;
  }
  & > .pane-map-top-left {
    left: 0;
    top: 0;
  }
  & > .fc-map-mode {
    bottom: 10px;
    right: 58px;
  }
  & > .fc-map-legend-wrapper {
    right: 20px;
    top: 12px;
    z-index: 9;
  }
  & > .fc-map-navigate {
    bottom: 77px;
    right: 20px;
    & > .fc-button {
      display: block;
      height: 32px;
      margin-top: 8px;
      min-width: 30px;
      width: 30px;
    }
  }
  & > .fc-half-width {
    width: 50%;
  }
  & .top-left-two {
    margin-top: 50px;
  }

  /*
   * MapboxGL style overrides.
   */
  &.mapboxgl-map {
    font: inherit;
  }
  .mapboxgl-ctrl-bottom-left {
    & > .mapboxgl-ctrl-scale {
      background-color: hsla(0%, 0%, 100%, 0.8);
      border-color: #272727;
      bottom: 0;
      color: #272727;
      font-size: 0.75rem;
      height: 17px;
      left: 174px;
      line-height: 0.875rem;
      position: absolute;
    }
    & > .mapboxgl-ctrl-attrib {
      background-color: hsla(0%, 0%, 100%, 0.8);
      bottom: 10px;
      color: #272727;
      font-size: 0.75rem;
      left: 19px;
      line-height: 0.875rem;
      padding: 2px;
      position: absolute;
      width: 160px;
      & a {
        color: #272727;
      }
      &.mapboxgl-compact {
        margin: 0;
      }
    }
  }
  .mapboxgl-ctrl-bottom-right {
    & > .mapboxgl-ctrl-group {
      bottom: 0;
      box-shadow:
        0 3px 1px -2px rgba(0, 0, 0, 0.2),
        0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 1px 5px 0 rgba(0, 0, 0, 0.12);
      position: absolute;
      right: 10px;
      & > button {
        transition-duration: 0.28s;
        transition-property: background-color;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        &:focus {
          background-color: #c1c1c1;
        }
      }
    }
  }
}
</style>
