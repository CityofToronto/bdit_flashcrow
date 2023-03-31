<template>
  <v-select
    v-model="internalDaysOfWeek"
    :error-messages="errorMessagesDaysOfWeek"
    hide-details="auto"
    :items="itemsDaysOfWeek"
    :disabled="isDurationInWeeks"
    :label="label"
    :messages="messagesDaysOfWeek"
    multiple
    outlined
    v-bind="$attrs">
    <template v-if="isDurationInWeeks" v-slot:selection="{ index }">
      <span v-if="index === 0">Sun - Sat</span>
    </template>
  </v-select>
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
    studyType() {
      return this.v.studyType.$model;
    },
    isMultiDayStudy() {
      return this.studyType.isMultiDay;
    },
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
        let numberDaysRequired = duration / 24;
        if (duration === 336) numberDaysRequired = 7;
        const msg = `Please select ${numberDaysRequired} consecutive days or reduce study duration.`;
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
      const durationInDays = this.v.duration.$model / 24;
      let message = 'The study will be performed on one of these days.';
      if (this.studyType !== null && this.isMultiDayStudy && durationInDays !== 1) {
        message = `The study will be performed across ${durationInDays} consecutive days.`;
      }
      return [message];
    },
    isDurationInWeeks() {
      const studyDuration = this.v.duration.$model;
      const weekInHours = 168;
      let isDurationInWeeks = false;
      if (Number.isInteger(studyDuration)
        && studyDuration !== 0
        && studyDuration % weekInHours === 0) isDurationInWeeks = true;
      return isDurationInWeeks;
    },
    label() {
      const partA = this.isMultiDayStudy ? 'Day(s)' : 'Day';
      return `${partA} of Week`;
    },
  },
  watch: {
    isDurationInWeeks(newValue) {
      if (newValue) this.v.daysOfWeek.$model = [0, 1, 2, 3, 4, 5, 6];
    },
  },
};
</script>
