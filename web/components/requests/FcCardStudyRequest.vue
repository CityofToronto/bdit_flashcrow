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
            <FcSelectEnum
              v-model="v.studyType.$model"
              dense
              :disabled="!selected"
              :error-messages="errorMessagesStudyType"
              hide-details="auto"
              item-text="label"
              label="Study Type"
              :of-type="StudyType"
              outlined />
          </v-col>
          <v-col class="py-2" cols="6">
            <v-select
              v-model="internalDaysOfWeek"
              dense
              :disabled="!selected"
              :error-messages="errorMessagesDaysOfWeek"
              hide-details="auto"
              :items="itemsDaysOfWeek"
              label="Days"
              multiple
              outlined />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-2" cols="6">
            <FcStudyRequestDuration
              v-if="studyRequest.studyType.automatic"
              dense
              :disabled="!selected"
              :v="v" />
            <FcStudyRequestHours
              v-else
              dense
              :disabled="!selected"
              :v="v" />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-2" cols="12">
            <v-textarea
              v-model="v.notes.$model"
              :disabled="!selected"
              :error-messages="errorMessagesNotes"
              label="Additional Information"
              :messages="messagesNotes"
              no-resize
              outlined
              rows="4"
              @blur="v.notes.$touch()"></v-textarea>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import { StudyHours, StudyType } from '@/lib/Constants';
import {
  OPTIONAL,
  REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK,
  REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
} from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';
import FcStudyRequestDuration from '@/web/components/requests/fields/FcStudyRequestDuration.vue';
import FcStudyRequestHours from '@/web/components/requests/fields/FcStudyRequestHours.vue';

export default {
  name: 'FcCardStudyRequest',
  components: {
    FcIconLocationMulti,
    FcSelectEnum,
    FcStudyRequestDuration,
    FcStudyRequestHours,
    FcTextMostRecent,
  },
  props: {
    iconProps: Object,
    location: Object,
    selected: Boolean,
    study: Object,
    studyRequest: Object,
    v: Object,
  },
  data() {
    return {
      StudyHours,
      StudyType,
    };
  },
  computed: {
    errorMessagesDaysOfWeek() {
      const errors = [];
      if (!this.v.daysOfWeek.required) {
        errors.push(REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK.text);
      }
      if (!this.v.daysOfWeek.$dirty && !this.v.duration.$dirty) {
        return errors;
      }
      const { duration } = this.internalValue;
      if (!this.v.duration.needsValidDaysOfWeek) {
        const n = duration / 24;
        const msg = `Please select ${n} consecutive days or reduce study duration.`;
        errors.push(msg);
      }
      return errors;
    },
    errorMessagesNotes() {
      const errors = [];
      if (!this.v.notes.requiredIfOtherHours) {
        errors.push(REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES.text);
      }
      return errors;
    },
    errorMessagesStudyType() {
      const errors = [];
      if (!this.v.studyType.required) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDY_TYPE.text);
      }
      return errors;
    },
    internalDaysOfWeek: {
      get() {
        return this.studyRequest.daysOfWeek;
      },
      set(daysOfWeek) {
        this.studyRequest.daysOfWeek = ArrayUtils.sortBy(daysOfWeek, i => i);
      },
    },
    itemsDaysOfWeek() {
      return TimeFormatters.DAYS_OF_WEEK.map((text, value) => ({ text, value }));
    },
    itemsDuration() {
      return [
        { text: '1 day', value: 24 },
        { text: '2 days', value: 48 },
        { text: '3 days', value: 72 },
        { text: '4 days', value: 96 },
        { text: '5 days', value: 120 },
        { text: '1 week', value: 168 },
      ];
    },
    messagesDuration() {
      const { duration } = this.studyRequest;
      if (duration === null) {
        return [];
      }
      return [`${duration} hours`];
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
