<template>
  <TdsButtonDropdown
    class="fc-filter-date"
    :class="'font-size-' + size">
    <template v-slot:title>
      <span>{{title}}</span>
    </template>
    <template v-slot:dropdown>
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
    </template>
  </TdsButtonDropdown>
</template>

<script>
import { mapState } from 'vuex';

import DatePicker from '@/web/components/DatePicker.vue';
import TdsButtonDropdown from '@/web/components/tds/TdsButtonDropdown.vue';
import DateTime from '@/lib/time/DateTime';
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
      minDate: DateTime.fromObject({ year: 1985, month: 1, day: 1 }),
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
      const { filterDate } = this.$store.state;
      if (filterDate === null) {
        return 'Dates';
      }
      const { start, end } = filterDate;
      const strStart = TimeFormatters.formatYearMonth(start);
      const strEnd = TimeFormatters.formatYearMonth(end);
      if (strStart === strEnd) {
        return strStart;
      }
      return `${strStart}-${strEnd}`;
    },
    tomorrow() {
      return this.now.plus({ days: 1 });
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
