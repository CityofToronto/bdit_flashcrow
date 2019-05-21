<template>
<TdsTopBar class="fc-filters-view-data-at-location">
  <template v-slot:left>
    <button class="font-size-l" disabled>
      All
    </button>
    <button class="font-size-l" disabled>
      Collisions
    </button>
    <FilterCountTypes
      class="font-size-l"
      :class="{
        'tds-button-success': filterCountTypes.length > 0
      }"
      @filter-count-types="onClickCounts" />
  </template>
  <template v-slot:right>
    <ToggleShowMap />
  </template>
</TdsTopBar>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import FilterCountTypes from '@/components/FilterCountTypes.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';
import TdsTopBar from '@/components/tds/TdsTopBar.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FcFiltersViewDataAtLocation',
  components: {
    FilterCountTypes,
    TdsTopBar,
    ToggleShowMap,
  },
  computed: {
    ...mapState(['filterCountTypes']),
  },
  methods: {
    onClickCounts() {
      if (this.filterCountTypes.length === 0) {
        this.setFilterCountTypes([...Constants.COUNT_TYPES.keys()]);
      }
    },
    ...mapMutations(['setFilterCountTypes']),
  },
};
</script>

<style lang="postcss">
.fc-filters-view-data-at-location {

}
</style>
