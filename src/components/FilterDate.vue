<template>
  <v-datepicker
    class="filter-date"
    v-model="filterDate"
    :calendar-button="true"
    calendar-button-icon="fa fa-calendar"
    :format="formatDate"
    placeholder="Enter count date"
    required />
</template>

<script>
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FilterDate',
  computed: {
    filterDate: {
      get() {
        return this.$store.state.filterDate;
      },
      set(filterDate) {
        this.$store.commit('setFilterDate', filterDate);
      },
    },
  },
  methods: {
    formatDate: TimeFormatters.formatDate,
  },
};
</script>

<style lang="postcss">
.filter-date {
  .vdp-datepicker__calendar-button {
    background-color: var(--white);
    border: 1px solid var(--outline-grey);
    font-size: var(--text-xl);
    margin-right: -6px;
    padding: var(--sp) calc(var(--sp) * 2);
    transition: border-color var(--transition-short) ease-in-out;
  }
  &:hover .vdp-datepicker__calendar-button {
    border-color: var(--outline-grey-focus);
  }
}
</style>
