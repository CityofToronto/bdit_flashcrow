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
export default {
  name: 'FcStudyRequestDuration',
  props: {
    v: Object,
  },
  data() {
    const itemsDuration = [
      { text: '1 day', value: 24 },
      { text: '2 days', value: 48 },
      { text: '3 days', value: 72 },
      { text: '4 days', value: 96 },
      { text: '5 days', value: 120 },
      { text: '1 week', value: 168 },
      { text: '2 weeks', value: 336 },
    ];
    return { itemsDuration };
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
      let caption = 'The study will be conducted on 1 day';
      if (!this.isSingleDayStudy) {
        const nDays = this.storeDurationInDays;
        const nHours = this.storeDurationInHours;
        if (nDays === 1) {
          caption += ' (24 hours)';
        } else {
          caption = `The study will be conducted across ${nDays} consecutive days (${nHours} hours)`;
        }
      }
      return caption;
    },
  },
};
</script>
