<template>
  <fieldset class="fc-details-study mb-l">
    <legend>
      <span class="number-icon">{{indexHuman}}</span>
      {{studyType.label}}
    </legend>
    <div class="flex-container-row mb-l">
      <div class="flex-1 px-m">
        <p>The study will fall on these days of the week:</p>
        <p class="font-size-l mb-xl">
          <strong>{{daysOfWeekHuman}}</strong>
        </p>
        <template v-if="studyType.automatic">
          <p>The duration of the study will be:</p>
          <p class="font-size-l">
            <strong>{{duration | durationHuman}}</strong><br />
            <small>{{duration}} hours</small>
          </p>
        </template>
        <template v-else>
          <p>We'll use these hours:</p>
          <p class="font-size-l">
            <strong>{{hoursHuman}}</strong>
          </p>
          <TdsPanel
            v-if="hours === 'SCHOOL' || hours === 'ROUTINE'"
            icon="clock"
            variant="info">
            <p>
              <small>
                <span
                  v-for="([start, end], i) in CountHours[hours]"
                  :key="'count-hours-' + i">{{i > 0 ? ', ' : ''}}{{start}}&ndash;{{end}}</span>
              </small>
            </p>
          </TdsPanel>
          <TdsPanel
            v-else-if="hours === 'OTHER'"
            icon="clock"
            variant="warning">
            <p>
              Schedule specified in additional notes.
            </p>
          </TdsPanel>
        </template>
      </div>
      <div class="flex-1 px-m">
        <template v-if="notes">
          <p>Additional notes:</p>
          <p class="font-size-l">
            <strong>{{notes}}</strong>
          </p>
        </template>
        <p v-else>{{COUNT_NO_ADDITIONAL_NOTES.text}}</p>
      </div>
    </div>
  </fieldset>
</template>

<script>
import { mapState } from 'vuex';

import TdsPanel from '@/components/tds/TdsPanel.vue';
import { CountHours, COUNT_TYPES } from '@/lib/Constants';
import { COUNT_NO_ADDITIONAL_NOTES } from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'CountDetailsSummary',
  components: {
    TdsPanel,
  },
  props: {
    index: Number,
  },
  data() {
    return {
      CountHours,
      COUNT_NO_ADDITIONAL_NOTES,
    };
  },
  computed: {
    dateRange() {
      return this.study.dateRange;
    },
    daysOfWeek() {
      return this.study.daysOfWeek;
    },
    daysOfWeekHuman() {
      return TimeFormatters.formatDaysOfWeek(this.daysOfWeek);
    },
    duration() {
      return this.study.duration;
    },
    hours() {
      return this.study.hours;
    },
    hoursHuman() {
      if (this.hours === 'ROUTINE') {
        return 'Routine';
      }
      if (this.hours === 'SCHOOL') {
        return 'School';
      }
      return 'Other';
    },
    indexHuman() {
      return this.index + 1;
    },
    notes() {
      return this.study.notes;
    },
    study() {
      return this.studyRequest.studies[this.index];
    },
    studyType() {
      const { studyType } = this.study;
      return COUNT_TYPES.find(({ value }) => value === studyType);
    },
    ...mapState(['studyRequest']),
  },
};
</script>

<style lang="postcss">
.fc-summary-study {

}
</style>
