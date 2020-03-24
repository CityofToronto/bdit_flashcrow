<template>
  <div
    class="fill-height pane-map"
    @mouseleave="clearHoveredFeature">
    <div class="pane-map-progress">
      <v-progress-linear
        :active="loading"
        indeterminate />
    </div>
    <FcSearchBarLocation
      v-if="!drawerOpen" />
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
    <FcPaneMapPopup
      v-if="hoveredFeature
        && featureKeyHovered !== featureKeySelected
        && featureKeyHovered === featureKeyHoveredPopup"
      :key="'h:' + featureKeyHovered"
      :feature="hoveredFeature"
      :hovered="true" />
    <FcPaneMapPopup
      v-if="!drawerOpen && selectedFeature"
      :key="'s:' + featureKeySelected"
      :feature="selectedFeature"
      :hovered="false" />
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';

import { CentrelineType, MapZoom } from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import GeoStyle from '@/lib/geo/GeoStyle';
import FcPaneMapPopup from '@/web/components/FcPaneMapPopup.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
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
  return `${layerId}:${id}`;
}

export default {
  name: 'FcPaneMap',
  components: {
    FcButton,
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
  data() {
    return {
      coordinates: null,
      loading: false,
      aerial: false,
      // keeps track of which feature we are currently hovering over
      hoveredFeature: null,
      // used to add slight debounce delay (250ms) to hovered popup
      featureKeyHoveredPopup: false,
      // keeps track of currently selected feature
      selectedFeature: null,
    };
  },
  computed: {
    featureKeyHovered() {
      return getFeatureKey(this.hoveredFeature);
    },
    featureKeySelected() {
      return getFeatureKey(this.selectedFeature);
    },
    mapStyle() {
      const { aerial } = this;
      const { dark } = this.$vuetify.theme;
      const options = {
        aerial,
        dark,
      };
      return GeoStyle.get(options);
    },
    ...mapState(['drawerOpen', 'location']),
  },
  created() {
    this.map = null;
  },
  mounted() {
    const bounds = BOUNDS_TORONTO;

    // marker
    this.selectedMarker = new mapboxgl.Marker()
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
      this.easeToLocation(this.location, null);
      this.map.on('load', () => {
        this.map.on('move', this.onMapMove.bind(this));
        this.map.on('click', this.onMapClick.bind(this));
        this.map.on('mousemove', this.onMapMousemove.bind(this));
      });
      this.map.on('dataloading', () => {
        this.loading = true;
      });
      this.map.on('idle', () => {
        this.loading = false;
        this.updateSelectedFeature();
      });
      this.updateSelectedMarker();
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
      this.updateSelectedMarker();
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
    onCountsClick(feature) {
      const [lng, lat] = feature.geometry.coordinates;
      const { centrelineId, centrelineType, numArteryCodes } = feature.properties;
      let description;
      if (numArteryCodes === 1) {
        description = '1 count station';
      }
      description = `${numArteryCodes} count stations`;
      const elementInfo = {
        centrelineId,
        centrelineType,
        description,
        /*
         * The backend doesn't provide these feature codes, so we have to fetch it from
         * the visible layer.
         */
        featureCode: null,
        lat,
        lng,
      };
      // get feature code from the visible layer, if possible
      const locationFeature = this.getFeatureForLocation({ centrelineId, centrelineType });
      if (locationFeature !== null) {
        const {
          featureCode,
          name: descriptionVisible,
        } = locationFeature.properties;
        elementInfo.description = descriptionVisible;
        elementInfo.featureCode = featureCode;
      }
      this.setLocation(elementInfo);
    },
    onCentrelineClick(feature, centrelineType) {
      // update location
      const [lng, lat] = getGeometryMidpoint(feature.geometry);
      const {
        centrelineId,
        featureCode,
        name: description,
      } = feature.properties;
      const elementInfo = {
        centrelineId,
        centrelineType,
        description,
        featureCode,
        lat,
        lng,
      };
      this.setLocation(elementInfo);
    },
    onMapClick(e) {
      const feature = this.getFeatureForPoint(e.point, {
        selectableOnly: true,
      });
      this.setSelectedFeature(feature);
      if (feature === null) {
        return;
      }
      const layerId = feature.layer.id;
      if (layerId === 'counts') {
        this.onCountsClick(feature);
      } else if (layerId === 'intersections') {
        this.onCentrelineClick(feature, CentrelineType.INTERSECTION);
      } else if (layerId === 'midblocks') {
        this.onCentrelineClick(feature, CentrelineType.SEGMENT);
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
    updateSelectedFeature() {
      const feature = this.getFeatureForLocation(this.location);
      if (feature === null) {
        this.clearSelectedFeature();
      } else {
        this.setSelectedFeature(feature);
      }
    },
    updateSelectedMarker() {
      if (this.location === null) {
        this.selectedMarker.remove();
      } else {
        const { lng, lat } = this.location;
        this.selectedMarker
          .setLngLat([lng, lat])
          .addTo(this.map);
      }
    },
    ...mapMutations(['setDrawerOpen', 'setLocation']),
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
  & > .fc-search-bar-location {
    top: 20px;
    position: absolute;
    left: 20px;
    z-index: var(--z-index-controls);
  }
  & > .pane-map-mode {
    bottom: 35px;
    position: absolute;
    right: 54px;
    z-index: var(--z-index-controls);
  }
  .mapboxgl-ctrl-bottom-right {
    & > .mapboxgl-ctrl-group {
      bottom: 25px;
      position: absolute;
      right: 6px;
    }
    & > .mapboxgl-ctrl-scale {
      background-color: rgba(0, 0, 0, 0.3);
      border-color: #dcdee0;
      bottom: 0;
      color: #dcdee0;
      font-size: 0.75rem;
      height: 17px;
      line-height: 0.875rem;
      position: absolute;
      right: 170px;
    }
    & > .mapboxgl-ctrl-attrib {
      background-color: rgba(0, 0, 0, 0.3);
      bottom: 10px;
      color: #dcdee0;
      font-size: 0.75rem;
      line-height: 0.875rem;
      padding: 2px 5px;
      position: absolute;
      right: 5px;
      width: 170px;
      & a {
        color: #dcdee0;
      }
    }
  }
}
</style>
