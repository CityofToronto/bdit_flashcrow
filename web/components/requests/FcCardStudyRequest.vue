<template>
  <v-card
    class="fc-card-study-request"
    :class="{ selected }"
    flat>
    <v-card-title class="align-start pb-2">
      <FcIconLocationMulti
        class="mr-5"
        v-bind="iconProps" />
      <div class="fc-card-study-request-title">
        <div>{{location.description}}</div>
        <FcTextMostRecent
          class="font-weight-regular"
          :study="study" />
      </div>
    </v-card-title>
    <v-card-text class="pb-0">
      <div class="mx-9">
        <v-row>
          <v-col class="py-2" cols="6">
            <v-select
              v-model="studyRequest.studyType"
              dense
              :disabled="!selected"
              hide-details
              :items="itemsStudyType"
              label="Study Type"
              outlined />
          </v-col>
          <v-col class="py-2" cols="6">
            <v-select
              v-model="studyRequest.daysOfWeek"
              dense
              :disabled="!selected"
              hide-details
              :items="itemsDaysOfWeek"
              label="Days"
              multiple
              outlined />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-2" cols="6">
            <v-select
              v-model="studyRequest.reasons"
              dense
              :disabled="!selected"
              hide-details
              :items="itemsReasons"
              label="Reasons"
              multiple
              outlined />
          </v-col>
          <v-col class="py-2" cols="6">
            <v-select
              v-model="studyRequest.hours"
              dense
              :disabled="!selected"
              hide-details
              :items="itemsHours"
              label="Hours"
              outlined />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-2" cols="12">
            <v-textarea
              v-model="studyRequest.notes"
              :disabled="!selected"
              label="Additional Information"
              :messages="messagesNotes"
              no-resize
              outlined
              rows="4"></v-textarea>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import {
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import { OPTIONAL } from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcCardStudyRequest',
  components: {
    FcIconLocationMulti,
    FcTextMostRecent,
  },
  props: {
    iconProps: Object,
    location: Object,
    selected: Boolean,
    study: Object,
    studyRequest: Object,
  },
  computed: {
    internalReasons: {
      get() {
        return this.studyRequest.reasons.map(({ name }) => name);
      },
      set(reasons) {
        this.studyRequest.reasons = reasons.map(name => StudyRequestReason.enumValueOf(name));
      },
    },
    itemsDaysOfWeek() {
      return TimeFormatters.DAYS_OF_WEEK.map((text, value) => ({ text, value }));
    },
    itemsHours() {
      return StudyHours.enumValues.map((value) => {
        const { description } = value;
        return { text: description, value };
      });
    },
    itemsReasons() {
      const itemsReasons = StudyRequestReason.enumValues.map((value) => {
        const { name, text } = value;
        return { text, value: name };
      });
      return ArrayUtils.sortBy(itemsReasons, ({ text }) => text);
    },
    itemsStudyType() {
      const itemsStudyType = StudyType.enumValues.map((studyType) => {
        const { label } = studyType;
        return { text: label, value: studyType };
      });
      return ArrayUtils.sortBy(itemsStudyType, ({ label }) => label);
    },
    messagesNotes() {
      const { hours } = this.studyRequest;
      if (hours === StudyHours.OTHER) {
        return [];
      }
      return [OPTIONAL.text];
    },
  },
};
</script>

<style lang="scss">
.fc-card-study-request.theme--light.v-sheet {
  border: 2px solid var(--v-border-base);
  &:not(.selected) {
    & .fc-card-study-request-title {
      color: var(--v-secondary-base);
      opacity: 0.75;
    }
  }
  &.selected {
    border: 2px solid var(--v-primary-base);
  }
}
</style>
