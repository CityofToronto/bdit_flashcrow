<template>
<div>
  <button
    class="font-size-l mr-m"
    :class="{
      'tds-button-success': !hasFilters,
    }"
    @click="clearFilters">
    All
  </button>
  <FcFilterCountTypes
    v-model="internalValue.countTypes"
    class="font-size-l mr-m"
    :class="{
      'tds-button-success': hasFilterCountTypes,
    }" />
  <FcFilterDate
    v-model="internalValue.date"
    class="mr-m"
    :class="{
      'tds-button-success': hasFilterDate,
    }"
    size="l" />
  <FcFilterDayOfWeek
    v-model="internalValue.dayOfWeek"
    class="font-size-l"
    :class="{
      'tds-button-success': hasFilterDayOfWeek,
    }" />
</div>
</template>

<script>
import { COUNT_TYPES } from '@/lib/Constants';
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
  props: {
    value: Object,
  },
  computed: {
    hasFilters() {
      return this.hasFilterCountTypes
        || this.hasFilterDate
        || this.hasFilterDayOfWeek;
    },
    hasFilterCountTypes() {
      return this.internalValue.countTypes.length !== COUNT_TYPES.length;
    },
    hasFilterDate() {
      return this.internalValue.date !== null;
    },
    hasFilterDayOfWeek() {
      return this.internalValue.dayOfWeek.length !== 7;
    },
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    clearFilters() {
      this.internalValue = {
        countTypes: [...COUNT_TYPES.keys()],
        date: null,
        dayOfWeek: [...Array(7).keys()],
      };
    },
  },
};
</script>
