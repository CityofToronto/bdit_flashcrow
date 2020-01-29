<template>
  <div
    class="fc-layout-drawer-map fill-height"
    :class="{
      horizontal: !vertical,
      vertical
    }">
    <div
      v-if="hasDrawer"
      class="pane-drawer-toggle elevation-3 font-size-xl"
      :class="{
        'drawer-open': drawerOpen,
      }"
      @click="setDrawerOpen(!drawerOpen)">
      <div class="text-center">
        <v-icon
          v-if="vertical"
          small>
          {{drawerOpen ? 'mdi-menu-down' : 'mdi-menu-up'}}
        </v-icon>
        <v-icon
          v-else
          small>
          {{drawerOpen ? 'mdi-menu-left' : 'mdi-menu-right'}}
        </v-icon>
      </div>
    </div>
    <div
      class="fc-pane-wrapper d-flex fill-height"
      :class="{
        'flex-column': vertical,
      }">
      <div
        v-show="(hasDrawer && drawerOpen) || vertical"
        class="elevation-3 flex-grow-1 flex-shrink-0"
        :class="{
          'order-2': vertical,
        }">
        <router-view></router-view>
      </div>
      <div
        v-show="!drawerOpen || !vertical"
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

  & > .pane-drawer-toggle {
    background-color: var(--white);
    color: var(--ink);
    cursor: pointer;
    position: absolute;
    z-index: var(--z-index-controls);

    &:hover {
      background-color: var(--base-lighter);
    }
  }
  &.horizontal > .pane-drawer-toggle {
    border-radius: 0 var(--space-s) var(--space-s) 0;
    height: 38px;
    top: 20px;
    &.drawer-open {
      left: 50%;
    }
  }
  &.vertical > .pane-drawer-toggle {
    border-radius: var(--space-s) var(--space-s) 0 0;
    bottom: 50%;
    height: 16px;
    left: calc(50% - 19px);
    width: 38px;
    & i {
      margin-top: -22px;
    }
    &.drawer-open {
      border-radius: 0 0 var(--space-s) var(--space-s);
      bottom: auto;
      top: 0;
    }
  }
  & > .fc-pane-wrapper > div {
    flex-basis: 0;
  }
  &.vertical > .fc-pane-wrapper > div {
    height: 50vh;
  }
}

</style>
