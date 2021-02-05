<template>
  <v-select
    v-model="internalDaysOfWeek"
    :error-messages="errorMessagesDaysOfWeek"
    hide-details="auto"
    :items="itemsDaysOfWeek"
    label="Study Days"
    :messages="messagesDaysOfWeek"
    multiple
    outlined
    v-bind="$attrs" />
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import { REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK } from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcStudyRequestDaysOfWeek',
  props: {
    v: Object,
  },
  data() {
    const itemsDaysOfWeek = TimeFormatters.DAYS_OF_WEEK.map((text, value) => ({ text, value }));
    return { itemsDaysOfWeek };
  },
  computed: {
    errorMessagesDaysOfWeek() {
      const errors = [];
      if (!this.v.daysOfWeek.$dirty && !this.v.duration.$dirty) {
        return errors;
      }
      if (!this.v.daysOfWeek.required) {
        errors.push(REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK.text);
      }
      if (!this.v.duration.needsValidDaysOfWeek) {
        const duration = this.v.duration.$model;
        const n = duration / 24;
        const msg = `Please select ${n} consecutive days or reduce study duration.`;
        errors.push(msg);
      }
      return errors;
    },
    internalDaysOfWeek: {
      get() {
        return this.v.daysOfWeek.$model;
      },
      set(daysOfWeek) {
        this.v.daysOfWeek.$model = ArrayUtils.sortBy(daysOfWeek, i => i);
      },
    },
    messagesDaysOfWeek() {
      const studyType = this.v.studyType.$model;
      if (studyType !== null && studyType.automatic) {
        const duration = this.v.duration.$model;
        const n = duration / 24;
        if (n === 1) {
          return ['The study will be performed on one of these days.'];
        }
        return [`The study will be performed across ${n} consecutive days.`];
      }
      return ['The study will be performed on one of these days.'];
    },
  },
};
</script>
