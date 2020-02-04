<template>
  <section class="fc-summary-study">
    <h2 class="mt-6">{{studyType.label}}</h2>
    <v-row class="mt-5 mb-6">
      <v-col cols="6">
        <div>Study Days</div>
        <div class="mt-1 title">
          {{study.daysOfWeek | daysOfWeek}}
        </div>
      </v-col>
      <v-col cols="6">
        <div>Study Hours</div>
        <div class="mt-1 title">
          <template v-if="studyType.automatic">
            <div>{{study.duration | durationHuman}}</div>
            <v-messages
              :value="[study.duration + ' hours']"></v-messages>
          </template>
          <template v-else>
            <div>{{studyHours.description}}</div>
            <v-messages
              :value="[studyHours.hint]"></v-messages>
          </template>
        </div>
      </v-col>
      <v-col cols="6">
        <div>Additional Information</div>
        <div class="mt-1 title">
          <span v-if="study.notes">{{study.notes}}</span>
          <span v-else>None</span>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<script>
import {
  CountHours,
  COUNT_TYPES,
  StudyHours,
} from '@/lib/Constants';

export default {
  name: 'FcSummaryStudy',
  props: {
    study: Object,
  },
  data() {
    return {
      CountHours,
    };
  },
  computed: {
    studyHours() {
      return StudyHours[this.study.hours];
    },
    studyType() {
      const { studyType } = this.study;
      return COUNT_TYPES.find(({ value }) => value === studyType);
    },
  },
};
</script>
