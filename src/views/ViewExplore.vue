<template>
  <LayoutMain class="view-explore">
    <template v-slot:navSecondary>
      <FilterBar />
    </template>
    <template v-slot:panes>
      <PaneMap />
    </template>
  </LayoutMain>
</template>

<script>
import FilterBar from '@/components/FilterBar.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import PaneMap from '@/components/PaneMap.vue';

export default {
  name: 'ViewExplore',
  components: {
    FilterBar,
    LayoutMain,
    PaneMap,
  },
};
</script>

<style lang="postcss">
.view-explore {
  & .pane-map {
    height: 100%;
    width: 100%;
  }
}
</style>
