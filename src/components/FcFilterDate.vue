<template>
  <TdsButtonDropdown
    class="fc-filter-date"
    :class="'font-size-' + size"
    :title="title">
    <DatePicker
      v-model="filterDate"
      class="fc-filter-date"
      :disabled-dates="{start: tomorrow, end: null}"
      is-expanded
      is-inline
      :max-date="now"
      :min-date="minDate"
      mode="range"
      placeholder="Filter by date"
      :size="size">
    </DatePicker>
  </TdsButtonDropdown>
</template>

<script>
import { mapState } from 'vuex';

import DatePicker from '@/components/DatePicker.vue';
import TdsButtonDropdown from '@/components/tds/TdsButtonDropdown.vue';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcFilterDate',
  components: {
    DatePicker,
    TdsButtonDropdown,
  },
  props: {
    size: String,
  },
  data() {
    return {
      minDate: new Date(1985, 0, 1),
    };
  },
  computed: {
    filterDate: {
      get() {
        return this.$store.state.filterDate;
      },
      set(filterDate) {
        this.$store.commit('setFilterDate', filterDate);
      },
    },
    title() {
      if (this.filterDate === null) {
        return 'Dates';
      }
      const { start, end } = this.filterDate;
      const strStart = TimeFormatters.formatYearMonth(start);
      const strEnd = TimeFormatters.formatYearMonth(end);
      if (strStart === strEnd) {
        return strStart;
      }
      return `${strStart}-${strEnd}`;
    },
    tomorrow() {
      return new Date(
        this.now.getFullYear(),
        this.now.getMonth(),
        this.now.getDate() + 1,
      );
    },
    ...mapState(['now']),
  },
};
</script>

<style lang="postcss">
.fc-filter-date {
  & > .dropdown {
    width: 300px;
  }
}
</style>
