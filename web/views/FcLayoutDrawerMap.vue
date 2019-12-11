<template>
  <main class="fc-layout-drawer-map flex-fill flex-container-column">
    <section class="panes flex-fill flex-container-row">
      <router-view
        v-show="drawerOpen"
        class="pane-display"></router-view>
      <PaneMap />
    </section>
  </main>
</template>

<script>
import { mapState } from 'vuex';

import PaneMap from '@/web/components/PaneMap.vue';

export default {
  name: 'FcLayoutDrawerMap',
  components: {
    PaneMap,
  },
  computed: {
    ...mapState(['drawerOpen']),
  },
};
</script>

<style lang="postcss">
.fc-layout-drawer-map {
  & > .panes {
    & > .pane-display {
      flex: 1.8;
    }
    & > .pane-map {
      flex: 1;
    }
  }
}
</style>
