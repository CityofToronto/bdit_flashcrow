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
            <strong>{{durationHuman}}</strong><br />
            <small>{{duration}} hours</small>
          </p>
        </template>
        <template v-else>
          <p>We'll use these hours:</p>
          <p class="font-size-l">
            <strong>{{hoursHuman}}</strong>
          </p>
          <div
            v-if="hours === 'SCHOOL'"
            class="tds-panel tds-panel-info">
            <i class="fa fa-clock"></i>
            <p>
              <small>
              07:30&ndash;09:30,
              10:00&ndash;11:00,
              12:00&ndash;13:30,
              14:15&ndash;15:45,
              16:00&ndash;18:00
              </small>
            </p>
          </div>
          <div
            v-else-if="hours === 'ROUTINE'"
            class="tds-panel tds-panel-info">
            <i class="fa fa-clock"></i>
            <p>
              <small>
              07:30&ndash;09:30,
              10:00&ndash;12:00,
              13:00&ndash;15:00,
              16:00&ndash;18:00
              </small>
            </p>
          </div>
          <div
            v-else-if="hours === 'OTHER'"
            class="tds-panel tds-panel-warning">
            <i class="fa fa-clock"></i>
            <p>
              Schedule specified in additional notes.
            </p>
          </div>
        </template>
      </div>
      <div class="flex-1 px-m">
        <template v-if="notes">
          <p>Additional notes:</p>
          <p class="font-size-l">
            <strong>{{notes}}</strong>
          </p>
        </template>
        <p v-else>No additional notes.</p>
      </div>
    </div>
  </fieldset>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

export default {
  name: 'CountDetailsSummary',
  props: {
    index: Number,
  },
  computed: {
    count() {
      return this.dataSelection.items[this.index].item;
    },
    dateRange() {
      return this.meta.dateRange;
    },
    daysOfWeek() {
      return this.meta.daysOfWeek;
    },
    daysOfWeekHuman() {
      if (this.daysOfWeek.length === 7) {
        return 'Any day';
      }
      return ArrayUtils
        .sortBy(this.daysOfWeek, i => i)
        .map(i => Constants.DAYS_OF_WEEK[i])
        .join(', ');
    },
    duration() {
      return this.meta.duration;
    },
    durationHuman() {
      const days = this.duration / 24;
      if (days === 1) {
        return '1 day';
      }
      if (days === 7) {
        return '1 week';
      }
      return `${days} days`;
    },
    hours() {
      return this.meta.hours;
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
    meta() {
      return this.studyRequest.items[this.index].meta;
    },
    notes() {
      return this.meta.notes;
    },
    studyType() {
      const studyType = this.studyRequest.items[this.index].item;
      return Constants.COUNT_TYPES
        .find(({ value }) => value === studyType);
    },
    ...mapState(['studyRequest']),
  },
};
</script>

<style lang="postcss">
.fc-summary-study {

}
</style>
