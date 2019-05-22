<template>
<TdsTopBar class="fc-filters-view-data-at-location">
  <template v-slot:left>
    <button
      class="font-size-l"
      :class="{
        'tds-button-success': !hasFilters,
      }"
      @click="clearFilters">
      All
    </button>
    <button class="font-size-l" disabled>
      Collisions
    </button>
    <FcFilterCountTypes
      class="font-size-l"
      :class="{
        'tds-button-success': hasFilterCountTypes,
      }" />
    <FcFilterDate
      :class="{
        'tds-button-success': filterDate !== null,
      }"
      size="l" />
  </template>
  <template v-slot:right>
    <ToggleShowMap />
  </template>
</TdsTopBar>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcFilterCountTypes from '@/components/FcFilterCountTypes.vue';
import FcFilterDate from '@/components/FcFilterDate.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';
import TdsTopBar from '@/components/tds/TdsTopBar.vue';

export default {
  name: 'FcFiltersViewDataAtLocation',
  components: {
    FcFilterCountTypes,
    FcFilterDate,
    TdsTopBar,
    ToggleShowMap,
  },
  computed: {
    ...mapGetters(['hasFilters', 'hasFilterCountTypes']),
    ...mapState(['filterCountTypes', 'filterDate']),
  },
  methods: {
    ...mapMutations(['clearFilters']),
  },
};
</script>

<style lang="postcss">
.fc-filters-view-data-at-location {

}
</style>
