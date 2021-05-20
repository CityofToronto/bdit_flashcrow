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
        class="fc-map flex-shrink-0"
        :class="{
          'flex-grow-1': !mapBackground,
          'order-1': vertical,
        }">
        <FcPaneMap
          :background="mapBackground"
          :show-location-selection="showLocationSelection" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcPaneMap from '@/web/components/FcPaneMap.vue';

export default {
  name: 'FcLayoutViewData',
  components: {
    FcButton,
    FcPaneMap,
    FcTooltip,
  },
  computed: {
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
    labelDrawerToggle() {
      const { drawerOpen, vertical } = this;
      if (vertical) {
        return drawerOpen ? 'Collapse page' : 'Expand page';
      }
      return drawerOpen ? 'Collapse side panel' : 'Expand side panel';
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
    ...mapState(['drawerOpen']),
  },
  methods: {
    ...mapMutations(['setDrawerOpen']),
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
      & > .fc-pane-wrapper > .fc-map {
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
