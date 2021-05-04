<template>
  <div
    class="fill-height pane-map"
    @mouseleave="clearHoveredFeature">
    <FcDialogConfirmMultiLocationLeave
      v-model="showConfirmMultiLocationLeave" />

    <template v-if="!background">
      <div class="pane-map-progress">
        <FcProgressLinear
          v-if="loading"
          aria-label="Loading map layers and data"
          silent />
      </div>
      <div
        class="pane-map-location-search"
        v-if="!drawerOpen && showSearch">
        <FcSelectorCollapsedLocation
          v-if="!showLocationSelection"
          class="mt-5 ml-5" />
        <FcSelectorMultiLocation
          v-else-if="locationMode.multi"
          class="elevation-2">
          <template v-slot:action>
            <FcButton
              type="secondary"
              @click="actionViewData">
              View Data
            </FcButton>
          </template>
        </FcSelectorMultiLocation>
        <FcSelectorSingleLocation
          v-else
          class="mt-5 ml-5" />

        <FcGlobalFilterBox
          v-if="showFilters"
          class="mt-5 ml-5"
          :readonly="filtersReadonly" />
      </div>

      <FcPaneMapLegend
        v-if="showLegend"
        v-model="internalLayers" />
      <div
        v-if="showModes"
        class="pane-map-mode">
        <FcButton
          class="mr-2"
          type="fab-text"
          @click="openGoogleMaps">
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
      <div class="pane-map-navigate">
        <FcButtonAria
          v-if="showLocationSelection"
          :aria-label="tooltipLocationMode"
          class="pa-0"
          :class="{
            primary: locationMode.multi,
            'white--text': locationMode.multi,
          }"
          :disabled="locationMode === LocationMode.MULTI_EDIT"
          left
          type="fab-text"
          @click="actionToggleLocationMode">
          <v-icon class="display-2">mdi-map-marker-multiple</v-icon>
        </FcButtonAria>
        <FcButtonAria
          v-if="locationsForMode.length > 0"
          aria-label="Recenter location"
          class="pa-0"
          left
          type="fab-text"
          @click="actionRecenterLocation">
          <v-icon class="display-2">mdi-map-marker-circle</v-icon>
        </FcButtonAria>
      </div>
      <FcPaneMapPopup
        v-if="showHoveredPopup"
        :key="'h:' + featureKeyHovered"
        :feature="hoveredFeature"
        :hovered="true"
        :show-action="showLocationSelection" />
      <FcPaneMapPopup
        v-if="showSelectedPopup"
        :key="'s:' + featureKeySelected"
        :feature="selectedFeature"
        :hovered="false"
        :show-action="showLocationSelection" />
    </template>
    <div
      v-else
      class="pane-map-background-overlay"></div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';
import { mapGetters, mapMutations, mapState } from 'vuex';

import {
  CentrelineType,
  LegendMode,
  LocationMode,
  MapZoom,
} from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { InvalidCompositeIdError } from '@/lib/error/MoveErrors';
import { getLocationsWaypointIndices } from '@/lib/geo/CentrelineUtils';
import GeoStyle from '@/lib/geo/GeoStyle';
import CompositeId from '@/lib/io/CompositeId';
import FcPaneMapPopup from '@/web/components/FcPaneMapPopup.vue';
import FcDialogConfirmMultiLocationLeave
  from '@/web/components/dialogs/FcDialogConfirmMultiLocationLeave.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcGlobalFilterBox from '@/web/components/filters/FcGlobalFilterBox.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcPaneMapLegend from '@/web/components/inputs/FcPaneMapLegend.vue';
import FcSelectorCollapsedLocation from '@/web/components/inputs/FcSelectorCollapsedLocation.vue';
import FcSelectorMultiLocation from '@/web/components/inputs/FcSelectorMultiLocation.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);

const ROUTES_EDIT_FILTERS = [
  'viewData',
  'viewDataAtLocation',
];

const ROUTES_FOCUS_LOCATIONS = [
  'requestStudyBulkEdit',
  'requestStudyBulkView',
  'requestStudyEdit',
  'requestStudyNew',
  'requestStudyView',
];

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

function getFeatureKeyRoute($route, locationMode) {
  if (locationMode.multi) {
    return null;
  }
  const { name } = $route;
  if (name === 'viewData'
    || name === 'requestStudyEdit'
    || name === 'requestStudyView') {
    return null;
  }
  const { s1 } = $route.params;
  try {
    const features = CompositeId.decode(s1);
    if (features.length === 0) {
      return null;
    }
    const [{ centrelineId, centrelineType }] = features;
    return `c:${centrelineType}:${centrelineId}`;
  } catch (err) {
    if (err instanceof InvalidCompositeIdError) {
      return null;
    }
    throw err;
  }
}

export default {
  name: 'FcPaneMap',
  components: {
    FcButton,
    FcButtonAria,
    FcDialogConfirmMultiLocationLeave,
    FcGlobalFilterBox,
    FcPaneMapLegend,
    FcPaneMapPopup,
    FcProgressLinear,
    FcSelectorCollapsedLocation,
    FcSelectorMultiLocation,
    FcSelectorSingleLocation,
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
    background: {
      type: Boolean,
      default: false,
    },
    showFilters: {
      type: Boolean,
      default: true,
    },
    showLegend: {
      type: Boolean,
      default: true,
    },
    showLocationSelection: {
      type: Boolean,
      default: true,
    },
    showModes: {
      type: Boolean,
      default: true,
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      aerial: false,
      coordinates: null,
      // used to add slight debounce delay (200ms) to hovered popup
      featureKeyHoveredPopup: null,
      // keeps track of which feature we are currently hovering over
      hoveredFeature: null,
      loading: false,
      LocationMode,
      // keeps track of currently selected feature
      selectedFeature: null,
      showConfirmMultiLocationLeave: false,
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
    featureKeyRoute() {
      return getFeatureKeyRoute(this.$route, this.locationMode);
    },
    featureKeySelected() {
      return getFeatureKey(this.selectedFeature);
    },
    filtersReadonly() {
      return !ROUTES_EDIT_FILTERS.includes(this.$route.name);
    },
    focusLocations() {
      return this.locationMode === LocationMode.MULTI_EDIT
        || ROUTES_FOCUS_LOCATIONS.includes(this.$route.name);
    },
    internalLayers: {
      get() {
        return this.layersForMode;
      },
      set(layers) {
        this.setLayers(layers);
      },
    },
    locationsGeoJson() {
      const locationsWaypointIndices = getLocationsWaypointIndices(
        this.locationsForMode,
        this.locationsSelectionForMode.locations,
      );

      const features = this.locationsForMode.map((location, i) => {
        const { geom: geometry, ...propertiesRest } = location;

        const waypointIndices = locationsWaypointIndices[i];

        let deselected = false;
        let selected = false;
        if (this.locationMode === LocationMode.MULTI_EDIT
          && waypointIndices.includes(this.locationsEditIndex)) {
          selected = true;
        } else if (this.locationMode === LocationMode.MULTI) {
          if (this.locationsIndicesDeselected.includes(i)) {
            deselected = true;
          }
          if (this.locationsIndex === i) {
            selected = true;
          }
        }

        const properties = {
          deselected,
          selected,
          ...propertiesRest,
        };
        return { type: 'Feature', geometry, properties };
      });
      return {
        type: 'FeatureCollection',
        features,
      };
    },
    locationsMarkersGeoJson() {
      const locationsWaypointIndices = getLocationsWaypointIndices(
        this.locationsForMode,
        this.locationsSelectionForMode.locations,
      );

      const features = [];
      this.locationsForMode.forEach((location, i) => {
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

        const waypointIndices = locationsWaypointIndices[i];
        const k = waypointIndices.length;
        /*
         * `locationIndex === -1` here indicates that the location is not a waypoint, and
         * can be drawn using a corridor marker.
         */
        let locationIndex = -1;
        let deselected = false;
        let selected = false;
        if (this.locationMode === LocationMode.MULTI_EDIT
          && waypointIndices.includes(this.locationsEditIndex)) {
          /*
           * In this case, we might have several consecutive waypoints at the same location,
           * which might cause the currently selected waypoint to be hidden - so we prioritize
           * it.
           */
          locationIndex = this.locationsEditIndex;
          selected = true;
        } else if (k > 0) {
          /*
           * Here there is no selected waypoint, so we just show the last matching waypoint.
           */
          locationIndex = waypointIndices[k - 1];
        }

        if (this.locationMode === LocationMode.MULTI) {
          if (this.locationsIndicesDeselected.includes(i)) {
            deselected = true;
          }
          if (this.locationsIndex === i) {
            selected = true;
          }
        }

        const midblock = propertiesRest.centrelineType === CentrelineType.SEGMENT;
        const { multi } = this.locationMode;
        const properties = {
          deselected,
          locationIndex,
          midblock,
          multi,
          selected,
          ...propertiesRest,
        };
        const feature = { type: 'Feature', geometry, properties };
        features.push(feature);
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
      const { dark } = this.$vuetify.theme;
      return {
        aerial,
        dark,
        filtersCollision,
        filtersCommon,
        filtersStudy,
        layers: { ...internalLayers },
      };
    },
    mapStyle() {
      return GeoStyle.get(this.mapOptions);
    },
    showHoveredPopup() {
      if (this.hoveredFeature === null) {
        return false;
      }
      return this.featureKeyHovered !== this.featureKeySelected
        && this.featureKeyHovered === this.featureKeyHoveredPopup;
    },
    showSelectedPopup() {
      if (this.selectedFeature === null) {
        return false;
      }
      const featureMatchesRoute = this.featureKeySelected === this.featureKeyRoute;
      if (this.vertical) {
        return !featureMatchesRoute;
      }
      return !this.drawerOpen || !featureMatchesRoute;
    },
    tooltipLocationMode() {
      if (this.locationMode.multi) {
        return 'Switch to single-location mode';
      }
      return 'Add location';
    },
    vertical() {
      const { vertical = false } = this.$route.meta;
      return vertical;
    },
    ...mapState([
      'drawerOpen',
      'locationsEditIndex',
      'locationsIndex',
      'locationsIndicesDeselected',
      'locationMode',
    ]),
    ...mapState('viewData', [
      'filtersCollision',
      'filtersCommon',
      'filtersStudy',
    ]),
    ...mapGetters([
      'locationActive',
      'locationsForMode',
      'locationsRouteParams',
      'locationsSelectionForMode',
    ]),
    ...mapGetters('mapLayers', [
      'layersForMode',
    ]),
  },
  created() {
    this.map = null;
  },
  mounted() {
    const bounds = BOUNDS_TORONTO;

    Vue.nextTick(() => {
      this.loading = false;
      this.map = new mapboxgl.Map({
        bounds,
        boxZoom: false,
        container: this.$el,
        dragRotate: false,
        maxBounds: bounds,
        minZoom: MapZoom.MIN,
        maxZoom: MapZoom.MAX,
        pitchWithRotate: false,
        renderWorldCopies: false,
        style: this.mapStyle,
        zoom: MapZoom.MIN,
      });
      this.updateCoordinates();
      this.map.addControl(
        new mapboxgl.AttributionControl({
          customAttribution: [
            '<span role="listitem"><a href="https://docs.mapbox.com/mapbox-gl-js/overview/">Mapbox GL</a></span>',
            '<span role="listitem">Powered by <a href="https://www.esri.com/">Esri</a></span>',
          ],
        }),
        'bottom-left',
      );
      this.map.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 128, unit: 'metric' }),
        'bottom-left',
      );
      this.map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        'bottom-right',
      );

      this.easeToLocations(this.locationsForMode, []);

      this.map.on('dataloading', () => {
        this.loading = true;
      });
      this.map.on('idle', () => {
        this.loading = false;
      });
      this.map.on('load', () => {
        this.updateLocationsSource();
        this.updateLocationsMarkersSource();
        this.map.on('move', this.onMapMove.bind(this));
        this.map.on('click', this.onMapClick.bind(this));
        this.map.on('mousemove', this.onMapMousemove.bind(this));
      });
    });
  },
  beforeDestroy() {
    /*
     * If the user navigates to a page that doesn't include `PaneMap` between `created()`
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
    drawerOpen() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
    focusLocations: {
      handler() {
        if (this.focusLocations) {
          this.setLegendMode(LegendMode.FOCUS_LOCATIONS);
        } else {
          this.setLegendMode(LegendMode.NORMAL);
        }
      },
      immediate: true,
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
    locationMode() {
      if (this.locationMode.multi) {
        this.selectedFeature = null;
      }
    },
    mapStyle() {
      this.map.setStyle(this.mapStyle);
      this.updateLocationsSource();
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
    locationsForMode(locationsForMode, locationsForModePrev) {
      this.easeToLocations(locationsForMode, locationsForModePrev);
    },
    locationsGeoJson() {
      this.updateLocationsSource();
    },
    locationsMarkersGeoJson() {
      this.updateLocationsMarkersSource();
    },
    showLocationSelection() {
      if (!this.showLocationSelection) {
        this.clearSelectedFeature();
      }
    },
    $route() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
  },
  methods: {
    actionRecenterLocation() {
      if (this.locationsForMode.length === 0) {
        return;
      }
      this.easeToLocations(this.locationsForMode, null);

      if (this.locationMode === LocationMode.SINGLE) {
        this.setToastInfo('Map recentered on selected location.');
      } else {
        this.setToastInfo('Map recentered on selected locations.');
      }
    },
    actionToggleAerial() {
      this.aerial = !this.aerial;
      if (this.aerial) {
        this.setToastInfo('The map is now in Aerial Mode.');
      } else {
        this.setToastInfo('The map is no longer in Aerial Mode.');
      }
    },
    actionToggleLocationMode() {
      if (this.locationMode === LocationMode.SINGLE) {
        this.setLocationMode(LocationMode.MULTI_EDIT);
      } else if (this.locationsForMode.length > 1) {
        this.showConfirmMultiLocationLeave = true;
      } else {
        this.setLocationMode(LocationMode.SINGLE);
      }
    },
    actionViewData() {
      const { name } = this.$route;
      if (name === 'viewDataAtLocation') {
        this.setDrawerOpen(true);
      }
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewDataAtLocation',
        params,
      });
    },
    clearHoveredFeature() {
      this.hoveredFeature = null;
    },
    setHoveredFeature(feature) {
      this.hoveredFeature = feature;
    },
    clearSelectedFeature() {
      this.selectedFeature = null;
    },
    setSelectedFeature(feature) {
      this.selectedFeature = feature;
    },
    easeToLocations(locations, locationsPrev) {
      if (locations.length > 0) {
        // build bounding box on locations
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(({ geom }) => {
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
        const cameraOptions = this.map.cameraForBounds(bounds, {
          maxZoom: MapZoom.LEVEL_1.minzoom,
          padding: 64,
        });
        this.map.easeTo(cameraOptions);
      } else if (locationsPrev.length === 0) {
        /*
         * If the user is first loading the map, we want to show all of Toronto.
         * Otherwise, the user has just cleared the location, and we want to keep
         * them in the same place to avoid confusion.
         */
        const center = BOUNDS_TORONTO.getCenter();
        this.map.easeTo({
          center,
          duration: 1000,
          zoom: MapZoom.LEVEL_3.minzoom,
        });
      }
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
     * TODO: within layers, rank by closest to `point`
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

      let features = this.map.queryRenderedFeatures(point, { layers });
      if (features.length > 0) {
        // see if a feature was clicked ... if so choose that one
        // if a feature was not clicked then get features in a bounding box
        return features[0];
      }
      const { x, y } = point;
      const bbox = [[x - 10, y - 10], [x + 10, y + 10]];
      features = this.map.queryRenderedFeatures(bbox, { layers });
      if (features.length === 0) {
        return null;
      }
      return features[0];
    },
    onMapClick(e) {
      if (!this.showLocationSelection) {
        return;
      }
      const feature = this.getFeatureForPoint(e.point, {
        selectableOnly: true,
      });
      this.setSelectedFeature(feature);
    },
    onMapMousemove(e) {
      const feature = this.getFeatureForPoint(e.point);
      this.setHoveredFeature(feature);
    },
    onMapMove: debounce(function onMapMove() {
      this.updateCoordinates();
    }, 1000),
    openGoogleMaps() {
      if (this.coordinates === null) {
        return;
      }
      const { lat, lng, zoom } = this.coordinates;
      const z = Math.round(zoom);
      const url = `https://www.google.com/maps/@${lat},${lng},${z}z`;
      window.open(url, '_blank');
    },
    updateCoordinates() {
      const { lat, lng } = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.coordinates = { lat, lng, zoom };
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
    ...mapMutations([
      'setDrawerOpen',
      'setLocationMode',
      'setToastInfo',
    ]),
    ...mapMutations('mapLayers', [
      'setLayers',
      'setLegendMode',
    ]),
  },
};
</script>

<style lang="scss">
.pane-map {
  background-color: var(--white);
  &.mapboxgl-map {
    font: inherit;
  }
  & > .pane-map-progress {
    position: absolute;
    top: 0;
    width: 100%;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-location-search {
    left: 0;
    position: absolute;
    top: 0;
    z-index: var(--z-index-controls);
    & > .fc-selector-multi-location {
      background-color: var(--v-shading-base);
      border-radius: 8px;
      height: 387px;
      width: 664px;
    }
  }
  & > .fc-pane-map-warning-older-data {
    position: absolute;
    right: 240px;
    top: 20px;
    z-index: var(--z-index-controls);
  }
  & > .fc-pane-map-legend {
    position: absolute;
    right: 20px;
    top: 20px;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-mode {
    bottom: 10px;
    position: absolute;
    right: 58px;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-navigate {
    bottom: 77px;
    position: absolute;
    right: 20px;
    z-index: var(--z-index-controls);
    & > .fc-button {
      display: block;
      height: 32px;
      margin-top: 8px;
      min-width: 30px;
      width: 30px;
    }
  }
  .mapboxgl-ctrl-bottom-left {
    & > .mapboxgl-ctrl-scale {
      background-color: hsla(0, 0%, 100%, 0.8);
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
      background-color: hsla(0, 0%, 100%, 0.8);
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
  & > .pane-map-background-overlay {
    background-color: rgba(39, 39, 39, 0.4);
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: calc(var(--z-index-controls) - 1);
  }
}
</style>
