<template>
    <v-row>
      <v-col cols="4">
        <template>
          <dt class="subtitle-1">Study Duration</dt>
          <dd class="mt-1 display-1">
            {{study.duration | durationHuman}}
          </dd>
          <dd>
            <v-messages
              class="mt-1"
              :value="[study.duration + ' hours']" />
          </dd>
        </template>
      </v-col>
      <v-col cols="4">
        <dt class="subtitle-1">Study Days</dt>
        <dd class="mt-1 display-1">
          {{study.daysOfWeek | daysOfWeek}}
        </dd>
        <dd v-if="messagesDaysOfWeek.length > 0">
          <v-messages
            class="mt-1"
            :value="messagesDaysOfWeek" />
        </dd>
      </v-col>
      <v-col cols="4">
        <template>
          <dt class="subtitle-1">Study Hours</dt>
          <dd class="mt-1 display-1">
            {{study.hours.description}}
          </dd>
          <dd>
            <v-messages
              class="mt-1"
              :value="[study.hours.hint]"></v-messages>
          </dd>
        </template>
      </v-col>
    </v-row>
  </template>

<script>
import { numConsecutiveDaysOfWeek } from '@/lib/time/TimeUtils';

export default {
  name: 'SingleCollectionDayFields',
  props: {
    study: Object,
  },
  computed: {
    messagesDaysOfWeek() {
      let message = '';
      const { daysOfWeek, duration, studyType } = this.study;
      const consecutiveStudyDays = numConsecutiveDaysOfWeek(daysOfWeek);
      const durationInDays = duration / 24;
      if (daysOfWeek.length !== 1 || consecutiveStudyDays !== durationInDays) {
        message = 'The study will be performed on one of these days.';
        if (studyType.isMultiDay && durationInDays !== 1) {
          message = `The study will be performed across ${durationInDays} consecutive days.`;
        }
      }
      return [message];
    },
  },
};
</script>
