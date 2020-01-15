<template>
  <TdsButtonDropdown class="fc-filter-date font-size-l">
    <template v-slot:title>
      <span>{{title}}</span>
    </template>
    <template v-slot:dropdown>
      <FcDatePicker
        v-model="internalValue"
        :max="now"
        :min="minDate"
        mode="range">
      </FcDatePicker>
    </template>
  </TdsButtonDropdown>
</template>

<script>
import { mapState } from 'vuex';

import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import TdsButtonDropdown from '@/web/components/tds/TdsButtonDropdown.vue';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcFilterDate',
  components: {
    FcDatePicker,
    TdsButtonDropdown,
  },
  props: {
    value: Object,
  },
  data() {
    return {
      minDate: DateTime.fromObject({ year: 1985, month: 1, day: 1 }),
    };
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
    title() {
      if (this.internalValue === null) {
        return 'Dates';
      }
      const [start, end] = this.internalValue;
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
