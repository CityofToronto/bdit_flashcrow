<template>
  <date-picker
    v-model="filterDate"
    class="filter-date"
    :disabled-dates="{start: tomorrow, end: null}"
    :input-props="{
      placeholder: 'Filter by date range'
    }"
    :max-date="now"
    :min-date="minDate"
    mode="range">
  </date-picker>
</template>

<script>
import DatePicker from '@/components/DatePicker.vue';

export default {
  name: 'FilterDate',
  components: {
    DatePicker,
  },
  data() {
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    return {
      minDate: new Date(1985, 0, 1),
      now,
      tomorrow,
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
  },
};
</script>

<style lang="postcss">
.filter-date {
}
</style>
