<template>
  <v-row>
    <v-col cols="4">
      <template>
        <dt class="subtitle-1">Duration</dt>
        <dd class="mt-1 display-1">1 day</dd>
        <dd>
          <v-messages
            class="mt-1"
            :value="[captions.duration]" />
        </dd>
      </template>
    </v-col>
    <v-col cols="4">
      <dt class="subtitle-1">Day Options</dt>
      <dd class="mt-1 display-1">
        {{study.daysOfWeek | daysOfWeek}}
      </dd>
      <dd>
        <v-messages
          class="mt-1"
          :value="[captions.days]" />
      </dd>
    </v-col>
    <v-col cols="4">
      <template>
        <dt class="subtitle-1">Hours</dt>
        <dd class="mt-1 display-1">
          {{study.hours.description}}
        </dd>
        <dd>
          <v-messages
            class="mt-1"
            :value="[hoursCaption]"></v-messages>
        </dd>
      </template>
    </v-col>
  </v-row>
</template>

<script>
import { StudyHours } from '@/lib/Constants';

export default {
  name: 'SingleCollectionDayFields',
  props: {
    study: Object,
  },
  data() {
    return {
      captions: {
        duration: 'The study will be conducted on 1 day',
        days: 'The study will be conducted on one of these days',
      },
    };
  },
  computed: {
    hoursCaption() {
      const { hours } = this.study;
      const isOtherHours = hours === StudyHours.OTHER;
      return isOtherHours ? 'See notes for requested hours' : hours.hint;
    },
  },
};
</script>
