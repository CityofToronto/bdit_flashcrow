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

import FcFilterCountTypes from '@/web/components/FcFilterCountTypes.vue';
import FcFilterDate from '@/web/components/FcFilterDate.vue';
import FcFilterDayOfWeek from '@/web/components/FcFilterDayOfWeek.vue';
import ToggleShowMap from '@/web/components/ToggleShowMap.vue';
import TdsTopBar from '@/web/components/tds/TdsTopBar.vue';

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
