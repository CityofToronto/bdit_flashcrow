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
      <FcSearchBarLocation
        v-if="!drawerOpen" />
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
      <div
        v-if="location !== null"
        class="pane-map-navigate">
        <v-tooltip
          left
          :z-index="100">
          <template v-slot:activator="{ on }">
            <FcButton
              aria-label="Recenter location"
              class="pa-0"
              type="fab-text"
              @click="recenterLocation()"
              v-on="on">
              <v-icon class="display-1">mdi-crosshairs-gps</v-icon>
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
import { mapMutations, mapState } from 'vuex';

import { CentrelineType, MapZoom } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import GeoStyle from '@/lib/geo/GeoStyle';
import FcPaneMapPopup from '@/web/components/FcPaneMapPopup.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcPaneMapLegend from '@/web/components/inputs/FcPaneMapLegend.vue';
import FcSearchBarLocation from '@/web/components/inputs/FcSearchBarLocation.vue';

const BOUNDS_TORONTO = new mapboxgl.LngLatBounds(
  new mapboxgl.LngLat(-79.639264937, 43.580995995),
  new mapboxgl.LngLat(-79.115243191, 43.855457183),
);

function getFeatureKey(feature) {
  if (feature === null) {
    return null;
  }
  const { layer: { id: layerId }, id } = feature;
  if (layerId === 'counts' || layerId === 'intersections' || layerId === 'midblocks') {
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
    FcSearchBarLocation,
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
      // used to add slight debounce delay (250ms) to hovered popup
      featureKeyHoveredPopup: null,
      // keeps track of which feature we are currently hovering over
      hoveredFeature: null,
      loading: false,
      // keeps track of currently selected feature
      selectedFeature: null,
    };
  },
  computed: {
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
    ...mapState(['drawerOpen', 'legendOptions', 'location']),
  },
  created() {
    this.map = null;
  },
  mounted() {
    const bounds = BOUNDS_TORONTO;

    // marker
    const $marker = document.createElement('div');
    $marker.className = 'fc-pane-map-marker';

    const markerOptions = {
      anchor: 'bottom',
      element: $marker,
    };
    this.locationMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(BOUNDS_TORONTO.getCenter());

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

      this.updateLocationMarker();
      this.easeToLocation(this.location, null);

      this.map.on('dataloading', () => {
        this.loading = true;
      });
      this.map.on('data', this.onMapData.bind(this));
      this.map.on('idle', () => {
        this.loading = false;
      });
      this.map.on('load', () => {
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
    drawerOpen() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
    hoveredFeature: debounce(function watchHoveredFeature() {
      this.featureKeyHoveredPopup = this.featureKeyHovered;
    }, 250),
    mapStyle() {
      this.map.setStyle(this.mapStyle);
    },
    location(location, oldLocation) {
      this.updateLocationMarker();
      if (this.location === null) {
        this.clearSelectedFeature();
        return;
      }
      const feature = this.getFeatureForLocation(this.location);
      if (this.selectedFeature !== null && feature !== null) {
        this.setSelectedFeature(feature);
      } else {
        this.easeToLocation(location, oldLocation);
      }
    },
    $route() {
      Vue.nextTick(() => {
        this.map.resize();
      });
    },
  },
  methods: {
    clearHoveredFeature() {
      if (this.hoveredFeature !== null) {
        this.map.setFeatureState(this.hoveredFeature, { hover: false });
        this.hoveredFeature = null;
      }
    },
    setHoveredFeature(feature) {
      this.clearHoveredFeature();
      if (feature !== null) {
        this.map.setFeatureState(feature, { hover: true });
        this.hoveredFeature = feature;
      }
    },
    clearSelectedFeature() {
      if (this.selectedFeature !== null) {
        this.map.setFeatureState(this.selectedFeature, { selected: false });
        this.selectedFeature = null;
      }
    },
    setSelectedFeature(feature) {
      this.clearSelectedFeature();
      if (feature !== null) {
        this.map.setFeatureState(feature, { selected: true });
        this.selectedFeature = feature;
      }
    },
    easeToLocation(location, oldLocation) {
      if (location !== null) {
        // zoom to location
        const { lat, lng } = location;
        const center = new mapboxgl.LngLat(lng, lat);
        const zoom = Math.max(this.map.getZoom(), MapZoom.LEVEL_1.minzoom);
        this.map.easeTo({
          center,
          duration: 1000,
          zoom,
        });
      } else if (oldLocation === null) {
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
      if (this.location === null) {
        return;
      }
      this.easeToLocation(this.location, null);
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
     * Fetches the vector tile feature for the given location, as stored in the Vuex store.
     *
     * @param {Object?} location - location to get feature for, or `null`
     * @returns {Object?} the matched feature, or `null` if no such feature
     */
    getFeatureForLocation(location) {
      if (location === null) {
        return null;
      }
      const { centrelineId, centrelineType } = location;
      if (centrelineType === CentrelineType.SEGMENT) {
        return this.getFeatureForLayerAndProperty(
          'midblocks',
          'centrelineId',
          centrelineId,
        );
      }
      if (centrelineType === CentrelineType.INTERSECTION) {
        let feature = this.getFeatureForLayerAndProperty(
          'counts',
          'centrelineId',
          centrelineId,
        );
        if (feature === null) {
          feature = this.getFeatureForLayerAndProperty(
            'intersections',
            'centrelineId',
            centrelineId,
          );
        }
        return feature;
      }
      return null;
    },
    /**
     * Fetches the vector tile feature for the given mouse location, usually from a mouse
     * event on the map.
     *
     * For usability, this matching is somewhat fuzzy: it will find the highest-priority
     * feature within a 20x20 bounding box centered on `point`.  Layers in descending
     * priority order:
     *
     * - intersections
     * - counts
     * - centreline
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
        'counts',
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
    onMapData(e) {
      if (this.location === null || this.map.isMoving() || !e.tile) {
        return;
      }
      const { centrelineType } = this.location;
      if ((centrelineType === CentrelineType.SEGMENT && e.sourceId !== 'midblocks')
        || (centrelineType === CentrelineType.INTERSECTION && e.sourceId === 'intersections')) {
        return;
      }
      const { lat, lng } = this.location;
      const {
        latRange: [latMin, latMax],
        lngRange: [lngMin, lngMax],
      } = e.target.transform;
      if (lat < latMin || lat > latMax || lng < lngMin || lng > lngMax) {
        return;
      }
      const feature = this.getFeatureForLocation(this.location);
      if (feature === null) {
        this.clearSelectedFeature();
      } else {
        console.log('selected', feature);
        this.setSelectedFeature(feature);
      }
    },
    onMapMousemove(e) {
      const feature = this.getFeatureForPoint(e.point);
      this.setHoveredFeature(feature);
    },
    onMapMove: debounce(function onMapMove() {
      this.updateCoordinates();
    }, 250),
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
    updateLocationMarker() {
      if (this.location === null) {
        this.locationMarker.remove();
      } else {
        const { lng, lat } = this.location;
        this.locationMarker
          .setLngLat([lng, lat])
          .addTo(this.map);
      }
    },
    ...mapMutations(['setDrawerOpen', 'setLegendOptions', 'setLocation']),
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
  & > .fc-search-bar-location-wrapper {
    left: 20px;
    top: 20px;
    position: absolute;
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
      height: 32px;
      min-width: 30px;
      width: 30px;
    }
  }
  .fc-pane-map-marker {
    background-image: url('/icons/map/pin.png');
    background-size: cover;
    height: 40px;
    width: 29px;
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
