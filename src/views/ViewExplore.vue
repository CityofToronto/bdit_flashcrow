<template>
  <LayoutMain class="view-explore">
    <template v-slot:navSecondary>
      <FilterDate />
      <FilterCountTypes />
      <router-link :to="{name: 'viewQuery', params: {query: 'test'}}">ViewQuery</router-link>
    </template>
    <template v-slot:panes>
      <PaneMap />
    </template>
  </LayoutMain>
</template>

<script>
import FilterCountTypes from '@/components/FilterCountTypes.vue';
import FilterDate from '@/components/FilterDate.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import PaneMap from '@/components/PaneMap.vue';

export default {
  name: 'ViewExplore',
  components: {
    FilterCountTypes,
    FilterDate,
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
