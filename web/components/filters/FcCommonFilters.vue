<template>
  <div>
    <fieldset class="mt-6">
      <legend class="headline">Date Range</legend>

      <FcDatePicker
        v-model="v.dateRangeStart.$model"
        class="mt-2"
        :error-messages="errorMessagesDateRangeStart"
        hide-details="auto"
        label="From (YYYY-MM-DD)"
        :max="now">
      </FcDatePicker>
      <FcDatePicker
        v-model="v.dateRangeEnd.$model"
        class="mt-2"
        :error-messages="errorMessagesDateRangeEnd"
        hide-details="auto"
        label="To (YYYY-MM-DD)"
        :max="now">
      </FcDatePicker>
    </fieldset>

    <fieldset class="mt-6">
      <legend class="headline">Days of the Week</legend>

      <v-checkbox
        v-for="(label, i) in DAYS_OF_WEEK"
        :key="i"
        v-model="internalValue.daysOfWeek"
        class="mt-2"
        hide-details
        :label="label"
        :value="i"></v-checkbox>
    </fieldset>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcCommonFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcDatePicker,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
    };
  },
  computed: {
    errorMessagesDateRangeStart() {
      const errors = [];
      if (!this.v.dateRangeStart.startBeforeEnd) {
        errors.push('From date must be before to date.');
      }
      return errors;
    },
    errorMessagesDateRangeEnd() {
      const errors = [];
      if (!this.v.dateRangeEnd.startBeforeEnd) {
        errors.push('From date must be before to date.');
      }
      return errors;
    },
    ...mapState(['now']),
  },
};
</script>
