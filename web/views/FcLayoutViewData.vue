<template>
  <div
    class="fc-layout-view-data fill-height"
    :class="{
      'drawer-open': drawerOpen,
      horizontal: !vertical,
      vertical
    }">
    <template v-if="hasDrawer">
      <FcButton
        v-if="vertical"
        class="pane-drawer-toggle mb-2"
        type="fab-text"
        @click="setDrawerOpen(!drawerOpen)">
        <v-icon
          color="primary"
          left>{{iconDrawerToggle}}</v-icon>
        {{labelDrawerToggle}}
      </FcButton>
      <FcTooltip v-else right>
        <template v-slot:activator="{ on }">
          <FcButton
            :aria-label="labelDrawerToggle"
            class="pane-drawer-toggle"
            type="icon"
            @click="setDrawerOpen(!drawerOpen)"
            v-on="on">
            <v-icon>{{iconDrawerToggle}}</v-icon>
          </FcButton>
        </template>
        <span>{{labelDrawerToggle}}</span>
      </FcTooltip>
    </template>
    <div
      class="fc-pane-wrapper d-flex fill-height"
      :class="{
        'flex-column': vertical,
      }">
      <div
        v-show="showDrawer"
        class="fc-drawer flex-grow-1 flex-shrink-0"
        :class="{
          'order-2': vertical,
        }">
        <router-view></router-view>
      </div>
      <div
        class="fc-map-wrapper flex-shrink-0"
        :class="{
          'flex-grow-1': !mapBackground,
          'order-1': vertical,
        }">
        <FcMap
          ref="map"
          class="fill-height"
          :filters-collision="filtersCollision"
          :filters-common="filtersCommon"
          :filters-study="filtersStudy"
          :layers.sync="internalLayers"
          :locations-state="locationsState">
          <template
            v-if="!drawerOpen"
            v-slot:top-left>
            <FcSelectorCollapsedLocation
              v-if="!showLocationSelection"
              class="mt-3 ml-5" />
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
              v-model="internalLocationsSelection"
              class="mt-3 ml-5" />

            <FcGlobalFilterBox
              class="mt-3 ml-5"
              :readonly="filtersReadonly" />
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
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcGlobalFilterBox from '@/web/components/filters/FcGlobalFilterBox.vue';
import FcMap from '@/web/components/geo/map/FcMap.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSelectorCollapsedLocation from '@/web/components/inputs/FcSelectorCollapsedLocation.vue';
import FcSelectorMultiLocation from '@/web/components/inputs/FcSelectorMultiLocation.vue';
import FcSelectorSingleLocation from '@/web/components/inputs/FcSelectorSingleLocation.vue';

export default {
  name: 'FcLayoutViewData',
  components: {
    FcButton,
    FcGlobalFilterBox,
    FcMap,
    FcTooltip,
    FcSelectorCollapsedLocation,
    FcSelectorMultiLocation,
    FcSelectorSingleLocation,
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
      const { drawerOpen, vertical } = this;
      if (vertical) {
        return drawerOpen ? 'mdi-arrow-collapse' : 'mdi-arrow-expand';
      }
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
      const { drawerOpen, vertical } = this;
      if (vertical) {
        return drawerOpen ? 'Collapse page' : 'Expand page';
      }
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

        const { multi } = this.locationMode;
        const state = {
          deselected,
          locationIndex,
          multi,
          selected,
        };
        return { location, state };
      });
    },
    mapBackground() {
      const { drawerOpen, vertical } = this;
      return drawerOpen && vertical;
    },
    showDrawer() {
      const { drawerOpen, hasDrawer, vertical } = this;
      return (hasDrawer && drawerOpen) || vertical;
    },
    showLocationSelection() {
      const { showLocationSelection } = this.$route.meta;
      return showLocationSelection;
    },
    vertical() {
      const { vertical } = this.$route.meta;
      return vertical;
    },
    ...mapState(['locationMode']),
    ...mapState('viewData', [
      'drawerOpen',
      'filtersCollision',
      'filtersCommon',
      'filtersStudy',
    ]),
    ...mapGetters(['locationsForMode', 'locationsSelectionForMode']),
    ...mapGetters('mapLayers', ['layersForMode']),
  },
  watch: {
    drawerOpen() {
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

  & > .fc-pane-wrapper > div {
    flex-basis: 0;
  }

  & > .pane-drawer-toggle {
    cursor: pointer;
    position: absolute;
    z-index: calc(var(--z-index-controls) + 1);
  }

  &.vertical {
    & > .pane-drawer-toggle {
      bottom: 50%;
      left: calc(50% - 80px);
      width: 160px;
    }
    & > .fc-pane-wrapper > div {
      height: 50%;
      &.fc-drawer {
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }
    }
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
      top: 12px;
      width: 16px;

      &:hover {
        background-color: var(--v-shading-base);
      }
    }
    & > .fc-pane-wrapper > div {
      width: 50%;
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
    &.vertical {
      & > .pane-drawer-toggle {
        bottom: calc(100% - 60px);
        left: calc(50% - 90px);
        width: 180px;
      }
      & > .fc-pane-wrapper > .fc-map-wrapper {
        height: 60px;
      }
      & > .fc-pane-wrapper > .fc-drawer {
        height: calc(100% - 60px);
      }
    }
  }
}

@media screen and (max-height: 900px) {
  .fc-layout-view-data {
    &.vertical .fc-pane-map-legend {
      max-height: 218px;
      overflow: auto;
    }
  }
}

</style>
