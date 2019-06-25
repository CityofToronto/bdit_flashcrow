<template>
  <TdsChecklistDropdown
    class="fc-filter-day-of-week"
    name="dayOfWeek"
    :options="options"
    v-model="filterDayOfWeek">
    <span>Days ({{filterDayOfWeek.length}})</span>
  </TdsChecklistDropdown>
</template>

<script>
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';

// TODO: clean this up, move to Constants or TimeFormatters
const DAYS_OF_WEEK = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

export default {
  name: 'FcFilterDayOfWeek',
  components: {
    TdsChecklistDropdown,
  },
  computed: {
    filterDayOfWeek: {
      get() {
        return this.$store.state.filterDayOfWeek;
      },
      set(filterDayOfWeek) {
        this.$store.commit('setFilterDayOfWeek', filterDayOfWeek);
      },
    },
    options() {
      return DAYS_OF_WEEK.map((label, i) => ({ label, value: i }));
    },
  },
};
</script>

<style lang="postcss">
.fc-filter-day-of-week {
  & > .dropdown {
    width: 200px;
  }
}
</style>
