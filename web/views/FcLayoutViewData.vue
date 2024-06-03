<template>
  <div
    class="fc-layout-view-data fill-height horizontal"
    :class="{ 'drawer-open': drawerOpen }">
    <FcDialogConfirmMultiLocationLeave
      v-model="showConfirmMultiLocationLeave" />
    <div class="fc-pane-wrapper fill-height">
      <div v-show="showDrawer" class="fc-drawer shading elevation-4"
        :class="{'fc-full-drawer':!showLocationSelection}">
        <router-view></router-view>
      </div>
      <div class="fc-map-wrapper fill-height">
        <FcMap
          ref="map"
          class="fill-height"
          :filters-collision="filtersCollision"
          :filters-common="filtersCommon"
          :filters-study="filtersStudy"
          :layers.sync="internalLayers"
          :location-active="locationActive"
          :locations-state="locationsState">
          <template v-if="!drawerOpen" v-slot:top-left>
            <FcSelectorCollapsedLocation
              v-if="!showLocationSelection"
              class="mt-3 ml-5" />
            <FcSelectorSingleLocation
              v-else v-model="internalLocationsSelection"
              class="mt-3 ml-5" />
          </template>
          <template v-if="!drawerOpen" v-slot:top-left-two>
            <FcGlobalFilterBox
              class="mt-3 ml-5"
              :readonly="filtersReadonly" />
          </template>

          <template
            v-if="showLocationSelection"
            v-slot:action-popup="feature">
            <v-divider></v-divider>

            <v-card-actions class="shading">
              <FcMapPopupActionViewData
                :feature="feature" />
            </v-card-actions>
          </template>
        </FcMap>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import { LegendMode, LocationMode } from '@/lib/Constants';
import { getLocationsWaypointIndices } from '@/lib/geo/CentrelineUtils';

import FcDialogConfirmMultiLocationLeave
  from '@/web/components/dialogs/FcDialogConfirmMultiLocationLeave.vue';
import FcGlobalFilterBox from '@/web/components/filters/FcGlobalFilterBox.vue';
import FcMap from '@/web/components/geo/map/FcMap.vue';
import FcMapPopupActionViewData from '@/web/components/geo/map/FcMapPopupActionViewData.vue';
import FcSelectorCollapsedLocation from '@/web/components/inputs/FcSelectorCollapsedLocation.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';

export default {
  name: 'FcLayoutViewData',
  components: {
    FcDialogConfirmMultiLocationLeave,
    FcGlobalFilterBox,
    FcMap,
    FcMapPopupActionViewData,
    FcSelectorCollapsedLocation,
    FcSelectorSingleLocation,
  },
  data() {
    return {
      LocationMode,
      showConfirmMultiLocationLeave: false,
      suppressMapPopup: false,
    };
  },
  computed: {
    filtersReadonly() {
      const { filtersReadonly } = this.$route.meta;
      return filtersReadonly;
    },
    focusLocations() {
      return this.locationMode === LocationMode.MULTI_EDIT;
    },
    hasDrawer() {
      return this.$route.name !== 'viewData';
    },
    iconDrawerToggle() {
      const { drawerOpen } = this;
      return drawerOpen ? 'mdi-menu-left' : 'mdi-menu-right';
    },
    internalLayers: {
      get() {
        return this.layersForMode;
      },
      set(layers) {
        this.setLayers(layers);
      },
    },
    internalLocationsSelection: {
      get() {
        return this.locationsSelectionForMode;
      },
      set(locationsSelection) {
        this.syncLocationsSelectionForMode(locationsSelection);
      },
    },
    labelDrawerToggle() {
      const { drawerOpen } = this;
      return drawerOpen ? 'Collapse side panel' : 'Expand side panel';
    },
    locationsState() {
      const locationsWaypointIndices = getLocationsWaypointIndices(
        this.locationsForMode,
        this.locationsSelectionForMode.locations,
      );

      return this.locationsForMode.map((location, i) => {
        const waypointIndices = locationsWaypointIndices[i];
        const k = waypointIndices.length;
        /*
         * `locationIndex === -1` here indicates that the location is not a waypoint, and
         * can be drawn using a corridor marker.
         */
        let locationIndex = -1;
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
          if (this.locationsIndex === i) {
            selected = true;
          }
        }

        const { multi } = this.locationMode;
        const state = {
          deselected: false,
          locationIndex,
          multi,
          selected,
        };
        return { location, state };
      });
    },
    mapBackground() {
      return true;
    },
    showDrawer() {
      const { drawerOpen, hasDrawer } = this;
      return (hasDrawer && drawerOpen);
    },
    showLocationSelection() {
      const { showLocationSelection } = this.$route.meta;
      return showLocationSelection;
    },
    ...mapState([
      'locationMode',
      'locationsEditIndex',
    ]),
    ...mapState('viewData', [
      'drawerOpen',
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
    ...mapGetters('mapLayers', ['layersForMode']),
  },
  watch: {
    drawerOpen() {
      if (this.drawerOpen) {
        this.suppressMapPopup = true;
      } else {
        this.suppressMapPopup = false;
      }
      Vue.nextTick(() => {
        this.$refs.map.resize();
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
    $route() {
      Vue.nextTick(() => {
        this.$refs.map.resize();
      });
    },
  },
  methods: {
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
    ...mapMutations(['setLocationMode']),
    ...mapMutations('mapLayers', ['setLayers', 'setLegendMode']),
    ...mapMutations('viewData', ['setDrawerOpen']),
    ...mapActions(['syncLocationsSelectionForMode']),
  },
};
</script>

<style lang="scss">
.fc-layout-view-data {
  position: relative;
  width: 100%;

  & > .pane-drawer-toggle {
    cursor: pointer;
    position: absolute;
    z-index: calc(var(--z-index-controls) + 1);
  }

  & .fc-map .fc-selector-multi-location {
    background-color: var(--v-shading-base);
    border-radius: 8px;
  }

  &.horizontal {
    & > .pane-drawer-toggle {
      background-color: var(--white);
      border-radius: 0 var(--space-s) var(--space-s) 0;

      /* modified version of .elevation-1 */
      box-shadow:
        0 2px 1px -1px rgba(0, 0, 0, 0.2),
        0 1px 1px 0 rgba(0, 0, 0, 0.14),
        2px 1px 3px 0 rgba(0, 0, 0, 0.12);
      color: var(--ink);
      height: 38px;
      margin-top: -19px;
      top: 50%;
      width: 16px;

      &:hover {
        background-color: var(--v-shading-base);
      }
    }
  }

  & .fc-pane-wrapper {
    position:relative;
    height: 100%;
    & .fc-map-wrapper {
      width: 100%;
      height: 100%;
    }
    & .fc-drawer {
      position:absolute;
      top: 0;
      left: 0;
      margin: 10px;
      width: 50%;
      max-width: 400px;
      min-width: 400px;
      min-height: 50px;
      border-radius: 8px;
      border: 1px solid lightgrey !important;
      overflow-y: hidden;
      max-height: calc(100% - 20px);
      z-index: 10;
      transition: min-width 0.25s cubic-bezier(0.7, 0, 0.84, 0);
    }
    & .fc-full-drawer {
      min-width: calc(100vw - 80px) !important;
      min-height: 52px;
    }
  }

  &.drawer-open {
    &.horizontal {
      & > .pane-drawer-toggle {
        border-left: 1px solid rgba(0, 0, 0, 0.12);
        left: 50%;
      }
      & > .fc-pane-wrapper > .fc-drawer {
        border-right: 1px solid rgba(0, 0, 0, 0.12);
      }
    }
  }
}

</style>
