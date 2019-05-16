<template>
  <main class="layout-view-data flex-fill flex-container-column">
    <router-view name="filters"></router-view>
    <section class="panes flex-fill flex-container-row">
      <router-view name="display"></router-view>
      <PaneMap v-if="showMap" />
    </section>
  </main>
</template>

<script>
import { mapState } from 'vuex';

import PaneMap from '@/components/PaneMap.vue';

export default {
  name: 'LayoutViewData',
  components: {
    PaneMap,
  },
  computed: {
    ...mapState(['showMap']),
  },
};
</script>

<style lang="postcss">
.layout-view-data {
  & .pane-display {
    flex: 2;
  }
  & .pane-map {
    flex: 1;
  }
}
</style>
