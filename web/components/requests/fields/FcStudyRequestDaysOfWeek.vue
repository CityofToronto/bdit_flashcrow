<template>
  <v-select
    v-model="internalDaysOfWeek"
    :error-messages="errorMessagesDaysOfWeek"
    hide-details="auto"
    :items="dayOptions"
    :disabled="isDurationInWeeks"
    label="Day(s) of Week"
    :messages="caption"
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

export default {
  name: 'FcStudyRequestDaysOfWeek',
  props: {
    v: Object,
  },
  data() {
    return {
      dayOptions: [
        {
          text: 'Sunday',
          value: 0,
        },
        {
          text: 'Monday',
          value: 1,
        },
        {
          text: 'Tuesday',
          value: 2,
        },
        {
          text: 'Wednesday',
          value: 3,
        },
        {
          text: 'Thursday',
          value: 4,
        },
        {
          text: 'Friday',
          value: 5,
        },
        {
          text: 'Saturday',
          value: 6,
        },
      ],
    };
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
        let numberDaysRequired = duration / 24;
        if (duration === 336) numberDaysRequired = 7;
        const msg = `Please select ${numberDaysRequired} consecutive days or reduce study duration`;
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
    studyDuration() {
      return this.v.duration.$model;
    },
    isDurationInWeeks() {
      const weekInHours = 168;
      let isDurationInWeeks = false;
      if (Number.isInteger(this.studyDuration)
        && this.studyDuration !== 0
        && this.studyDuration % weekInHours === 0) isDurationInWeeks = true;
      return isDurationInWeeks;
    },
    isSingleDaySelected() {
      return this.internalDaysOfWeek.length === 1;
    },
    caption() {
      let caption = 'The study will be conducted within the range of selected days';
      if (this.isSingleDaySelected) {
        const day = this.dayOptions[this.internalDaysOfWeek[0]].text;
        caption = `The study will be conducted on a ${day}`;
      }
      return caption;
    },
  },
  watch: {
    isDurationInWeeks(newValue) {
      if (newValue) this.v.daysOfWeek.$model = [0, 1, 2, 3, 4, 5, 6];
    },
  },
};
</script>
