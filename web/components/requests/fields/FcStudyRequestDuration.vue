<template>
  <v-select
    v-model="v.duration.$model"
    hide-details="auto"
    :items="itemsDuration"
    label="Duration"
    :messages="messagesDuration"
    outlined
    v-bind="$attrs" />
</template>

<script>
import { numConsecutiveDaysOfWeek } from '@/lib/time/TimeUtils';

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
    messagesDuration() {
      const duration = this.v.duration.$model;
      if (duration === null) {
        return [];
      }
      return [`${duration} hours`];
    },
  },
  created() {
    const daysOfWeek = this.v.daysOfWeek.$model;
    const n = numConsecutiveDaysOfWeek(daysOfWeek);
    this.v.duration.$model = n * 24;
    this.v.hours.$model = null;
  },
};
</script>
