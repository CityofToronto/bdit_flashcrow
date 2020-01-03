<template>
  <TdsChecklistDropdown
    class="fc-filter-day-of-week"
    name="dayOfWeek"
    :options="options"
    v-model="internalValue">
    <span>Days ({{internalValue.length}})</span>
  </TdsChecklistDropdown>
</template>

<script>
import TdsChecklistDropdown from '@/web/components/tds/TdsChecklistDropdown.vue';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcFilterDayOfWeek',
  components: {
    TdsChecklistDropdown,
  },
  props: {
    value: Array,
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    options() {
      return TimeFormatters.DAYS_OF_WEEK.map((label, i) => ({ label, value: i }));
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
