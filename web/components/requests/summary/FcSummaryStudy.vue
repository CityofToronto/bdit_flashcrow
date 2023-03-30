<template>
  <v-card
    outlined
    tag="section">
    <v-card-title class="d-flex">
      <img
        :alt="alt"
        class="mr-5"
        height="20"
        src="/icons/map/location-single.svg"
        width="16" />
      <h4 class="headline font-weight-bold">
        <span>{{study.studyType.label}}</span>
        <span v-if="study.studyType.other">
          ({{study.studyTypeOther.trim()}})
        </span>
      </h4>
    </v-card-title>

    <v-card-text class="default--text">
      <div class="mx-9">
        <v-row tag="dl">
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
            <template v-if="study.studyType.isMultiDay">
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
            <dt class="subtitle-1">Notes</dt>
            <dd class="mt-1 display-1">
              <span v-if="study.notes">{{study.notes}}</span>
              <span v-else>None</span>
            </dd>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import { numConsecutiveDaysOfWeek } from '@/lib/time/TimeUtils';

export default {
  name: 'FcSummaryStudy',
  props: {
    location: Object,
    study: Object,
  },
  computed: {
    alt() {
      const description = getLocationsSelectionDescription(this.locationsSelection);
      return `Study Location: ${description}`;
    },
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
    ...mapState(['locationsSelection']),
  },
};
</script>
