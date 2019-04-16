<template>
  <LayoutMain
    class="view-query"
    :class="{'show-map': showMap}">
    <template v-slot:navSecondary>
      <FilterDate />
      <FilterCountTypes />
      <ToggleShowMap />
    </template>
    <template v-slot:panes>
      <PaneDisplay>
        <template v-slot:title>
          <h2>Available Data</h2>
        </template>
        <template v-slot:content>
          <p>test</p>
        </template>
        <template v-slot:actionBar>
          <router-link
            class="btn btn-primary"
            :to="{name: 'requestsNewRequest'}">
            RequestsNewRequest
          </router-link>
        </template>
      </PaneDisplay>
      <PaneMap />
    </template>
  </LayoutMain>
</template>

<script>
import { mapState } from 'vuex';

import FilterCountTypes from '@/components/FilterCountTypes.vue';
import FilterDate from '@/components/FilterDate.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

export default {
  name: 'ViewQuery',
  components: {
    FilterCountTypes,
    FilterDate,
    LayoutMain,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
  },
  computed: {
    ...mapState(['showMap']),
  },
};
</script>

<style lang="postcss">
.view-query {
  & .pane-display {
    flex-grow: 2;
  }
  & .pane-map {
    display: none;
  }
  &.show-map .pane-map {
    display: block;
    flex-grow: 1;
  }
}
</style>
