<template>
<div class="py-m">
  <button
    class="font-size-l mr-m"
    :class="{
      'tds-button-success': !hasFilters,
    }"
    @click="clearFilters">
    All
  </button>
  <button class="font-size-l mr-m" disabled>
    Collisions
  </button>
  <FcFilterCountTypes
    class="font-size-l mr-m"
    :class="{
      'tds-button-success': hasFilterCountTypes,
    }" />
  <FcFilterDate
    class="mr-m"
    :class="{
      'tds-button-success': filterDate !== null,
    }"
    size="l" />
  <FcFilterDayOfWeek
    class="font-size-l mr-m"
    :class="{
      'tds-button-success': hasFilterDayOfWeek,
    }" />
</div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import FcFilterCountTypes from '@/web/components/FcFilterCountTypes.vue';
import FcFilterDate from '@/web/components/FcFilterDate.vue';
import FcFilterDayOfWeek from '@/web/components/FcFilterDayOfWeek.vue';

export default {
  name: 'FcFiltersViewDataAtLocation',
  components: {
    FcFilterCountTypes,
    FcFilterDate,
    FcFilterDayOfWeek,
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
