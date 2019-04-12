<template>
  <v-datepicker
    v-model="filterDate"
    bootstrap-styling
    :format="formatDate"
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

</style>
