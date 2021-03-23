<template>
  <div>
    <fieldset class="mt-4">
      <legend class="headline">Study Types</legend>

      <template v-for="studyType in StudyType.enumValues">
        <v-checkbox
          v-if="studyType.dataAvailable"
          :key="studyType.name"
          v-model="internalValue.studyTypes"
          class="mt-2"
          hide-details
          :label="studyType.label"
          :value="studyType"></v-checkbox>
      </template>
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

    <fieldset class="mt-6">
      <legend class="headline">Date Range</legend>

      <FcDatePicker
        v-model="$v.internalValue.dateRangeStart.$model"
        class="mt-2"
        :error-messages="errorMessagesDateRangeStart"
        hide-details="auto"
        label="From (YYYY-MM-DD)"
        :max="now">
      </FcDatePicker>
      <FcDatePicker
        v-model="$v.internalValue.dateRangeEnd.$model"
        class="mt-2"
        :error-messages="errorMessagesDateRangeEnd"
        hide-details="auto"
        label="To (YYYY-MM-DD)"
        :max="now">
      </FcDatePicker>
    </fieldset>

    <fieldset class="mt-6">
      <legend class="headline">Hours</legend>

      <v-checkbox
        v-for="studyHours in StudyHours.enumValues"
        :key="studyHours.name"
        v-model="internalValue.hours"
        class="mt-2"
        hide-details
        :label="studyHours.description"
        :value="studyHours"></v-checkbox>
    </fieldset>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import {
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';
import ValidationsStudyFilters from '@/lib/validation/ValidationsStudyFilters';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcDatePicker,
  },
  data() {
    return {
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
      StudyHours,
      StudyType,
    };
  },
  computed: {
    applyDateRange() {
      const { dateRangeStart, dateRangeEnd } = this.internalValue;
      return dateRangeStart !== null || dateRangeEnd !== null;
    },
    errorMessagesDateRangeStart() {
      const errors = [];
      if (!this.$v.internalValue.dateRangeStart.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    errorMessagesDateRangeEnd() {
      const errors = [];
      if (!this.$v.internalValue.dateRangeEnd.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    ...mapState(['now']),
  },
  validations: {
    internalValue: ValidationsStudyFilters,
  },
  watch: {
    applyDateRange() {
      this.internalValue.applyDateRange = this.applyDateRange;
    },
  },
};
</script>
