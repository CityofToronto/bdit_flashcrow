<template>
  <section>
    <h4 class="headline mt-5">{{study.studyType.label}}</h4>
    <v-row class="mt-2 mb-6" tag="dl">
      <v-col cols="6">
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
      <v-col cols="6">
        <template v-if="study.studyType.automatic">
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
        <template v-else>
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
      <v-col cols="12">
        <dt class="subtitle-1">Additional Information</dt>
        <dd class="mt-1 display-1">
          <span v-if="study.notes">{{study.notes}}</span>
          <span v-else>None</span>
        </dd>
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
      const { daysOfWeek, duration, studyType } = this.study;
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
