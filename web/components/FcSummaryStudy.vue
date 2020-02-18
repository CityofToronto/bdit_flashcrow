<template>
  <section class="fc-summary-study">
    <h2 class="headline mt-6">{{study.studyType.label}}</h2>
    <v-row class="mt-5 mb-6">
      <v-col cols="6">
        <div class="subtitle-1">Study Days</div>
        <div class="mt-1 display-1">
          {{study.daysOfWeek | daysOfWeek}}
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Study Hours</div>
        <div class="mt-1 display-1">
          <template v-if="study.studyType.automatic">
            <div>{{study.duration | durationHuman}}</div>
            <v-messages
              class="mt-1"
              :value="[study.duration + ' hours']"></v-messages>
          </template>
          <template v-else>
            <div>{{study.hours.description}}</div>
            <v-messages
              class="mt-1"
              :value="[study.hours.hint]"></v-messages>
          </template>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Additional Information</div>
        <div class="mt-1 display-1">
          <span v-if="study.notes">{{study.notes}}</span>
          <span
            v-else
            class="unselected--text">None</span>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<script>
export default {
  name: 'FcSummaryStudy',
  props: {
    study: Object,
  },
};
</script>
