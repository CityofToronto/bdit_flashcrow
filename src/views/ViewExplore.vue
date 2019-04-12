<template>
  <LayoutMain>
    <template v-slot:navSecondary>
      <b-col cols="2">
        <FilterDate />
      </b-col>
      <b-col cols="2">
        <FilterCountTypes />
      </b-col>
      <b-col cols="2" offset="6" class="text-right">
        <router-link :to="{name: 'viewQuery', params: {query: 'test'}}">ViewQuery</router-link>
      </b-col>
    </template>
    <template v-slot:panes>
      <PaneMap :cols="12" />
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

</style>
