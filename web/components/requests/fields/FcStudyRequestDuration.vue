<template>
  <v-select
    v-model="v.duration.$model"
    hide-details="auto"
    :items="itemsDuration"
    :disabled="isSingleDayStudy"
    label="Duration"
    :messages="caption"
    outlined
    v-bind="$attrs" />
</template>

<script>
import { StudyType } from '@/lib/Constants';

export default {
  name: 'FcStudyRequestDuration',
  props: {
    v: Object,
  },
  computed: {
    studyType() {
      return this.v.studyType.$model;
    },
    isSingleDayStudy() {
      return !this.studyType.isMultiDay;
    },
    storeDurationInHours() {
      return this.v.duration.$model;
    },
    storeDurationInDays() {
      return this.storeDurationInHours / 24;
    },
    caption() {
      const mainClause = 'The study will be conducted';
      const nDays = this.storeDurationInDays;
      const nHours = this.storeDurationInHours;
      let caption = `${mainClause} on 1 day`;
      if (!this.isSingleDayStudy && nDays === 1) {
        caption = `${mainClause} on 1 day (24 consecutive hours)`;
      } else if (!this.isSingleDayStudy && nDays > 1) {
        caption = `${mainClause} across ${nDays} consecutive days (${nHours} hours)`;
      }
      return caption;
    },
    itemsDuration() {
      if (this.studyType === StudyType.BIKE_COUNT
      || this.studyType === StudyType.PED_COUNT
      || this.studyType === StudyType.ATR_SVC) {
        const itemsDuration = [
          { text: '1 day', value: 24 },
          { text: '3 days', value: 72 },
          { text: '1 week', value: 168 },
        ];
        return itemsDuration;
      }
      const itemsDuration = [
        { text: '1 day', value: 24 },
        { text: '2 days', value: 48 },
        { text: '3 days', value: 72 },
        { text: '4 days', value: 96 },
        { text: '5 days', value: 120 },
        { text: '1 week', value: 168 },
        { text: '2 weeks', value: 336 },
      ];
      return itemsDuration;
    },
  },
};
</script>
