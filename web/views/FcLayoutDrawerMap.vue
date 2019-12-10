<template>
  <main class="fc-layout-drawer-map flex-fill flex-container-column">
    <section class="panes flex-fill flex-container-row">
      <router-view class="pane-display"></router-view>
      <PaneMap />
    </section>
  </main>
</template>

<script>
import PaneMap from '@/web/components/PaneMap.vue';

export default {
  name: 'FcLayoutDrawerMap',
  components: {
    PaneMap,
  },
};
</script>

<style lang="postcss">
.fc-layout-drawer-map {
  & > .panes > .pane-display {
    flex: 2;
  }
  & > .panes > .pane-map {
    flex: 1;
  }
}
</style>
