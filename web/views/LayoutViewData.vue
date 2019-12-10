<template>
  <main class="layout-view-data flex-fill flex-container-column">
    <section class="panes flex-fill flex-container-row">
      <router-view name="display"></router-view>
      <PaneMap />
    </section>
  </main>
</template>

<script>
import PaneMap from '@/web/components/PaneMap.vue';

export default {
  name: 'LayoutViewData',
  components: {
    PaneMap,
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
