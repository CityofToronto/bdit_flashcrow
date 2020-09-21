<template>
  <section>
    <h2 class="headline mt-5">{{study.studyType.label}}</h2>
    <v-row class="mt-2 mb-6">
      <v-col cols="6">
        <div class="subtitle-1">Study Days</div>
        <div class="mt-1 display-1">
          {{study.daysOfWeek | daysOfWeek}}
        </div>
        <v-messages
          class="mt-1"
          :value="messagesDaysOfWeek"></v-messages>
      </v-col>
      <v-col cols="6">
        <template v-if="study.studyType.automatic">
          <div class="subtitle-1">Study Duration</div>
          <div class="mt-1 display-1">
            {{study.duration | durationHuman}}
          </div>
          <v-messages
            class="mt-1"
            :value="[study.duration + ' hours']"></v-messages>
        </template>
        <template v-else>
          <div class="subtitle-1">Study Hours</div>
          <div class="mt-1 display-1">
            {{study.hours.description}}
          </div>
          <v-messages
            class="mt-1"
            :value="[study.hours.hint]"></v-messages>
        </template>
      </v-col>
      <v-col cols="12">
        <div class="subtitle-1">Additional Information</div>
        <div class="mt-1 display-1">
          <span v-if="study.notes">{{study.notes}}</span>
          <span v-else>None</span>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<script>
import { numConsecutiveDaysOfWeek } from '@/lib/time/TimeUtils';

export default {
  name: 'FcSummaryStudy',
  props: {
    study: Object,
  },
  computed: {
    messagesDaysOfWeek() {
      const { daysOfWeek, duration, studyType } = this.studyRequest;
      if (studyType.automatic) {
        const k = numConsecutiveDaysOfWeek(daysOfWeek);
        const n = duration / 24;
        if (k === n) {
          return [];
        }
        if (n === 1) {
          return ['The study will be performed on one of these days.'];
        }
        return [`The study will be performed across ${n} consecutive days.`];
      }
      if (daysOfWeek.length === 1) {
        return [];
      }
      return ['The study will be performed on one of these days.'];
    },
  },
};
</script>
