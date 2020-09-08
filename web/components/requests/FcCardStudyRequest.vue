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
              v-model="studyRequest.studyType"
              dense
              :disabled="!selected"
              hide-details
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
              hide-details
              :items="itemsDaysOfWeek"
              label="Days"
              multiple
              outlined />
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-2" cols="6">
            <FcSelectEnum
              v-model="studyRequest.hours"
              dense
              :disabled="!selected"
              hide-details
              item-text="description"
              label="Hours"
              :of-type="StudyHours"
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
import { StudyHours, StudyType } from '@/lib/Constants';
import { OPTIONAL } from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcCardStudyRequest',
  components: {
    FcIconLocationMulti,
    FcSelectEnum,
    FcTextMostRecent,
  },
  props: {
    iconProps: Object,
    location: Object,
    selected: Boolean,
    study: Object,
    studyRequest: Object,
  },
  data() {
    return {
      StudyHours,
      StudyType,
    };
  },
  computed: {
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
