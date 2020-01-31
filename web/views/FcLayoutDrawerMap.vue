<template>
  <div
    class="fc-layout-drawer-map fill-height"
    :class="{
      'drawer-open': drawerOpen,
      horizontal: !vertical,
      vertical
    }">
    <div
      v-if="hasDrawer"
      class="pane-drawer-toggle elevation-n1 font-size-xl"
      @click="setDrawerOpen(!drawerOpen)">
      <div class="text-center">
        <v-icon small>{{iconDrawerToggle}}</v-icon>
      </div>
    </div>
    <div
      class="fc-pane-wrapper d-flex fill-height"
      :class="{
        'flex-column': vertical,
      }">
      <div
        v-show="showDrawer"
        class="fc-drawer elevation-3 flex-grow-1 flex-shrink-0"
        :class="{
          'order-2': vertical,
        }">
        <router-view></router-view>
      </div>
      <div
        v-show="showMap"
        class="flex-grow-1 flex-shrink-0"
        :class="{
          'order-1': vertical,
        }">
        <PaneMap />
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import PaneMap from '@/web/components/PaneMap.vue';

export default {
  name: 'FcLayoutDrawerMap',
  components: {
    PaneMap,
  },
  computed: {
    hasDrawer() {
      return this.$route.name !== 'viewData';
    },
    iconDrawerToggle() {
      const { drawerOpen, vertical } = this;
      if (vertical) {
        return drawerOpen ? 'mdi-menu-down' : 'mdi-menu-up';
      }
      return drawerOpen ? 'mdi-menu-left' : 'mdi-menu-right';
    },
    showDrawer() {
      const { drawerOpen, hasDrawer, vertical } = this;
      return (hasDrawer && drawerOpen) || vertical;
    },
    showMap() {
      const { drawerOpen, vertical } = this;
      return !drawerOpen || !vertical;
    },
    vertical() {
      return this.$route.name === 'viewReportsAtLocation';
    },
    ...mapState(['drawerOpen']),
  },
  methods: {
    ...mapMutations(['setDrawerOpen']),
  },
};
</script>

<style lang="postcss">
.fc-layout-drawer-map {
  position: relative;
  width: 100%;

  & > .fc-pane-wrapper > div {
    flex-basis: 0;
  }

  & > .pane-drawer-toggle {
    background-color: var(--white);
    color: var(--ink);
    cursor: pointer;
    position: absolute;
    z-index: var(--z-index-controls);

    &:hover {
      background-color: var(--base-lightest);
    }
  }

  &.horizontal {
    & > .pane-drawer-toggle {
      border-radius: 0 var(--space-s) var(--space-s) 0;
      height: 38px;
      top: 20px;
    }
    & > .fc-pane-wrapper > div {
      width: 50%;
    }
  }

  &.vertical {
    & > .pane-drawer-toggle {
      border-radius: var(--space-s) var(--space-s) 0 0;
      bottom: 50%;
      height: 16px;
      left: calc(50% - 19px);
      width: 38px;
      & i {
        margin-top: -22px;
      }
    }
    & > .fc-pane-wrapper > div {
      height: 50%;
    }
  }

  &.drawer-open {
    &.horizontal > .pane-drawer-toggle {
      left: 50%;
    }
    &.vertical {
      & > .pane-drawer-toggle {
        border-radius: 0 0 var(--space-s) var(--space-s);
        bottom: auto;
        top: 0;
      }
      & > .fc-pane-wrapper > div {
        height: 100%;
      }
    }
  }
}

</style>
