<template>
<TdsTopBar class="fc-filters-view-data-at-location">
  <template v-slot:left>
    <button class="font-size-l" disabled>
      All
    </button>
    <button class="font-size-l" disabled>
      Collisions
    </button>
    <FcFilterCountTypes
      class="font-size-l"
      :class="{
        'tds-button-success': filterCountTypes.length > 0,
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
import { mapState } from 'vuex';

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
    ...mapState(['filterCountTypes', 'filterDate']),
  },
};
</script>

<style lang="postcss">
.fc-filters-view-data-at-location {

}
</style>
