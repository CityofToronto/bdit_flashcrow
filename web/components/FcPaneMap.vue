<template>
  <div
    class="fill-height pane-map"
    @mouseleave="clearHoveredFeature">
    <template v-if="!background">
      <div class="pane-map-progress">
        <v-progress-linear
          :active="loading"
          indeterminate />
      </div>
      <div
        class="pane-map-location-search"
        v-if="!drawerOpen">
        <FcSelectorMultiLocation
          v-if="locationMode.multi"
          class="elevation-2" />
        <FcSelectorSingleLocation
          v-else
          class="mt-5 ml-5" />
      </div>
      <FcPaneMapLegend
        v-model="internalLegendOptions" />
      <div class="pane-map-mode">
        <FcButton
          class="mr-2"
          type="fab-text"
          @click="openGoogleMaps">
          Street View
        </FcButton>
        <FcButton
          type="fab-text"
          @click="aerial = !aerial">
          {{ aerial ? 'Map' : 'Aerial' }}
        </FcButton>
      </div>
      <div class="pane-map-navigate">
        <v-tooltip
          left
          :z-index="100">
          <template v-slot:activator="{ on }">
            <FcButton
              :aria-label="tooltipLocationMode"
              class="pa-0"
              :class="{
                primary: locationMode.multi,
                'white--text': locationMode.multi,
              }"
              type="fab-text"
              @click="actionToggleLocationMode"
              v-on="on">
              <v-icon class="display-2">mdi-map-marker-multiple</v-icon>
            </FcButton>
          </template>
          <span>{{tooltipLocationMode}}</span>
        </v-tooltip>
        <v-tooltip
          v-if="locationsForMode.length > 0"
          left
          :z-index="100">
          <template v-slot:activator="{ on }">
            <FcButton
              aria-label="Recenter location"
              class="pa-0"
              type="fab-text"
              @click="recenterLocation()"
              v-on="on">
              <v-icon class="display-2">mdi-map-marker-circle</v-icon>
            </FcButton>
          </template>
          <span>Recenter location</span>
        </v-tooltip>
      </div>
      <FcPaneMapPopup
        v-if="showHoveredPopup"
        :key="'h:' + featureKeyHovered"
        :feature="hoveredFeature"
        :hovered="true" />
      <FcPaneMapPopup
        v-if="showSelectedPopup"
        :key="'s:' + featureKeySelected"
        :feature="selectedFeature"
        :hovered="false" />
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

import { CentrelineType, LocationMode, MapZoom } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import GeoStyle from '@/lib/geo/GeoStyle';
import FcPaneMapPopup from '@/web/components/FcPaneMapPopup.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcPaneMapLegend from '@/web/components/inputs/FcPaneMapLegend.vue';
import FcSelectorMultiLocation from '@/web/components/inputs/FcSelectorMultiLocation.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);

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

function getFeatureKeyRoute($route) {
  const {
    params: {
      centrelineId = null,
      centrelineType = null,
    },
  } = $route;
  if (centrelineType === null || centrelineId === null) {
    return null;
  }
  return `c:${centrelineType}:${centrelineId}`;
}

export default {
  name: 'FcPaneMap',
  components: {
    FcButton,
    FcPaneMapLegend,
    FcPaneMapPopup,
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
      // keeps track of currently selected feature
      selectedFeature: null,
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
      return getFeatureKeyRoute(this.$route);
    },
    featureKeySelected() {
      return getFeatureKey(this.selectedFeature);
    },
    internalLegendOptions: {
      get() {
        return this.legendOptions;
      },
      set(legendOptions) {
        this.setLegendOptions(legendOptions);
      },
    },
    locationsGeoJson() {
      const features = this.locationsForMode.map(
        ({ geom: geometry, ...properties }) => ({ type: 'Feature', geometry, properties }),
      );
      return {
        type: 'FeatureCollection',
        features,
      };
    },
    locationsMarkersGeoJson() {
      const waypoints = this.locationsSelectionForMode.locations;
      const n = waypoints.length;

      let waypointIndex = 0;
      let waypoint = waypoints[waypointIndex];
      const features = [];
      this.locationsForMode.forEach((location) => {
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

        /*
         * It is possible for the current location to match multiple consecutive waypoints.
         * We could forbid selecting the same location multiple times, but that would introduce
         * a lot of validation complexity in both frontend and backend.  It would also make it
         * impossible to select a corridor that loops back on itself.
         *
         * `waypointIndices` represents the subsequence of `waypoints`, starting at the current
         * `waypointIndex`, that matches the current location.
         */
        const waypointIndices = [];
        while (waypointIndex < n
          && propertiesRest.centrelineType === waypoint.centrelineType
          && propertiesRest.centrelineId === waypoint.centrelineId) {
          waypointIndices.push(waypointIndex);
          waypointIndex += 1;
          waypoint = waypoints[waypointIndex];
        }
        const k = waypointIndices.length;

        /*
         * `locationIndex === null` here indicates that the location is not a waypoint, and
         * can be drawn using a corridor marker.
         */
        let locationIndex = -1;
        let selected = false;
        if (k === 0) {
          if (propertiesRest.centrelineType === CentrelineType.SEGMENT) {
            // We only show corridor markers at intersections.
            return;
          }
        } else if (waypointIndices.includes(this.locationsEditIndex)) {
          /*
           * In this case, we might have several consecutive waypoints at the same location,
           * which might cause the currently selected waypoint to be hidden - so we prioritize
           * it.
           */
          locationIndex = this.locationsEditIndex;
          selected = true;
        } else {
          /*
           * Here there is no selected waypoint, so we just show the last matching waypoint.
           */
          locationIndex = waypointIndices[k - 1];
        }

        const { multi } = this.locationMode;
        const properties = {
          locationIndex,
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
      const { aerial, legendOptions } = this;
      const { dark } = this.$vuetify.theme;
      return {
        aerial,
        dark,
        ...legendOptions,
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
      const { vertical = false } = this.$route.meta;
      const featureMatchesRoute = this.featureKeySelected === this.featureKeyRoute;
      if (vertical) {
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
    ...mapState([
      'drawerOpen',
      'legendOptions',
      'locationsEditIndex',
      'locationMode',
    ]),
    ...mapGetters([
      'locationsForMode',
      'locationsSelectionForMode',
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
            '<a href="https://docs.mapbox.com/mapbox-gl-js/overview/">Mapbox GL</a>',
            'Powered by <a href="https://www.esri.com/">Esri</a>',
          ],
        }),
        'bottom-right',
      );
      this.map.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 192, unit: 'metric' }),
        'bottom-right',
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
    hoveredFeature: debounce(function watchHoveredFeature() {
      this.featureKeyHoveredPopup = this.featureKeyHovered;
    }, 200),
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
    $route() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
  },
  methods: {
    actionToggleLocationMode() {
      if (this.locationMode === LocationMode.SINGLE) {
        this.setLocationMode(LocationMode.MULTI_EDIT);
      } else {
        this.setLocationMode(LocationMode.SINGLE);
      }
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
    recenterLocation() {
      if (this.locationsForMode.length === 0) {
        return;
      }
      this.easeToLocations(this.locationsForMode, null);
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
      this.map.getSource('locations').setData(this.locationsGeoJson);
    },
    updateLocationsMarkersSource() {
      GeoStyle.setData('locations-markers', this.locationsMarkersGeoJson);
      this.map.getSource('locations-markers').setData(this.locationsMarkersGeoJson);
    },
    ...mapMutations([
      'setDrawerOpen',
      'setLegendOptions',
      'setLocationMode',
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
  }
  & > .fc-pane-map-legend {
    top: 20px;
    position: absolute;
    right: 20px;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-mode {
    bottom: 35px;
    position: absolute;
    right: 58px;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-navigate {
    bottom: 102px;
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
  .mapboxgl-ctrl-bottom-right {
    & > .mapboxgl-ctrl-group {
      bottom: 25px;
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
      }
    }
    & > .mapboxgl-ctrl-scale {
      border-color: #272727;
      bottom: 0;
      color: #272727;
      font-size: 0.75rem;
      height: 17px;
      line-height: 0.875rem;
      position: absolute;
      right: 174px;
    }
    & > .mapboxgl-ctrl-attrib {
      bottom: 10px;
      color: #272727;
      font-size: 0.75rem;
      line-height: 0.875rem;
      padding: 2px;
      position: absolute;
      right: 19px;
      width: 160px;
      & a {
        color: #272727;
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
