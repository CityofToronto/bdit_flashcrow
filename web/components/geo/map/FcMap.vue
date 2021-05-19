<template>
  <div class="fc-map">
    <div class="fc-map-controls fc-map-progress">
      <FcProgressLinear
        v-if="loading"
        aria-label="Loading map layers and data"
        silent />
    </div>

    <div class="fc-map-controls fc-map-mode">
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

    <div class="fc-map-controls fc-map-legend-wrapper">
      <FcMapLegend
        v-if="showLegend"
        v-model="internalLayers" />
    </div>

    <div class="fc-map-controls fc-map-navigate">
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
  </div>
</template>

<script>
import maplibregl from 'maplibre-gl/dist/maplibre-gl';
import Vue from 'vue';
import { mapMutations } from 'vuex';

import { MapZoom } from '@/lib/Constants';
import {
  defaultCollisionFilters,
  defaultCommonFilters,
  defaultStudyFilters,
} from '@/lib/filters/DefaultFilters';
import GeoStyle from '@/lib/geo/GeoStyle';
import { BOUNDS_TORONTO, makeMaplibreGlMap } from '@/lib/geo/map/MaplibreGlBase';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcMapLegend from '@/web/components/geo/legend/FcMapLegend.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';

export default {
  name: 'FcMap',
  components: {
    FcButton,
    FcButtonAria,
    FcMapLegend,
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
          collisions: true,
          hospitals: true,
          schools: true,
          studies: true,
          volume: false,
        };
      },
    },
    locationsState: {
      type: Array,
      default() { return []; },
    },
    showLegend: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      aerial: false,
      coordinates: null,
      loading: false,
    };
  },
  computed: {
    internalLayers: {
      get() {
        return this.layers;
      },
      set(layers) {
        this.$emit('update:layers', layers);
      },
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
        this.updateLocationsMarkersSource();
        this.easeToLocationsState(this.locationsState, []);
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
    locationsGeoJson() {
      this.updateLocationsSource();
    },
    locationsMarkersGeoJson() {
      this.updateLocationsMarkersSource();
    },
    locationsState(locationsState, locationsStatePrev) {
      this.easeToLocationsState(locationsState, locationsStatePrev);
    },
    mapStyle() {
      this.map.setStyle(this.mapStyle);
    },
  },
  methods: {
    actionRecenterLocation() {
      if (this.locationsState.length === 0) {
        return;
      }
      this.easeToLocationsState(this.locationsState, []);
    },
    actionToggleAerial() {
      this.aerial = !this.aerial;
      if (this.aerial) {
        this.setToastInfo('The map is now in Aerial Mode.');
      } else {
        this.setToastInfo('The map is no longer in Aerial Mode.');
      }
    },
    easeToLocationsState(locationsState, locationsStatePrev) {
      if (locationsState.length > 0) {
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
        const cameraOptions = this.map.cameraForBounds(bounds, {
          maxZoom: MapZoom.LEVEL_1.minzoom,
          padding: 64,
        });
        this.map.easeTo(cameraOptions);
      } else if (locationsStatePrev.length === 0) {
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
    openGoogleMaps() {
      if (this.map === null) {
        return;
      }
      const { lat, lng } = this.map.getCenter();
      const zoom = this.map.getZoom();
      const z = Math.round(zoom);
      const url = `https://www.google.com/maps/@${lat},${lng},${z}z`;
      window.open(url, '_blank');
    },
    resize() {
      if (this.map !== null) {
        this.map.resize();
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
    position: absolute;
    z-index: var(--z-index-controls);
  }
  & > .fc-map-progress {
    top: 0;
    width: 100%;
  }
  & > .fc-map-mode {
    bottom: 10px;
    right: 58px;
  }
  & > .fc-map-legend-wrapper {
    right: 20px;
    top: 12px;
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

  /*
   * MapboxGL style overrides.
   */
  &.mapboxgl-map {
    font: inherit;
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
}
</style>
