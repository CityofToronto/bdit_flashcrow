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
    <FcFilterDayOfWeek
      class="font-size-l"
      :class="{
        'tds-button-success': hasFilterDayOfWeek,
      }" />
  </template>
  <template v-slot:right>
    <ToggleShowMap />
  </template>
</TdsTopBar>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcFilterCountTypes from '@/src/components/FcFilterCountTypes.vue';
import FcFilterDate from '@/src/components/FcFilterDate.vue';
import FcFilterDayOfWeek from '@/src/components/FcFilterDayOfWeek.vue';
import ToggleShowMap from '@/src/components/ToggleShowMap.vue';
import TdsTopBar from '@/src/components/tds/TdsTopBar.vue';

export default {
  name: 'FcFiltersViewDataAtLocation',
  components: {
    FcFilterCountTypes,
    FcFilterDate,
    FcFilterDayOfWeek,
    TdsTopBar,
    ToggleShowMap,
  },
  computed: {
    ...mapGetters(['hasFilters', 'hasFilterCountTypes', 'hasFilterDayOfWeek']),
    ...mapState(['filterCountTypes', 'filterDate', 'filterDayOfWeek']),
  },
  methods: {
    ...mapMutations(['clearFilters']),
  },
};
</script>
