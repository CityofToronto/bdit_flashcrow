<template>
  <fieldset>
    <legend class="sr-only">Study Type for Request</legend>
    <v-messages :value="[REQUEST_STUDY_TIME_TO_FULFILL.text]" />
    <v-row class="mt-2">
      <v-col class="my-0 py-2" cols="6">
        <FcStudyRequestStudyType
          ref="autofocus"
          dense
          :location="location"
          :v="v" />
      </v-col>
    </v-row>
    <v-row class="mt-5">
      <v-col class="my-0 py-2" cols="4">
        <FcStudyRequestDuration
          dense
          :v="v" />
      </v-col>
      <v-col class="my-0 py-2" cols="4">
        <FcStudyRequestDaysOfWeek
          v-if="isMultiDayStudy"
          dense
          :v="v" />
        <SrDayOptionsInput
          v-else
          dense
          :v="v"
        />
      </v-col>
      <v-col class="my-0 py-2" cols="4">
        <FcStudyRequestHours
          dense
          :v="v" />
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col class="my-0 pt-0" cols="12">
        <FcStudyRequestNotes :v="v" />
      </v-col>
    </v-row>
  </fieldset>
</template>

<script>
import FcStudyRequestDaysOfWeek
  from '@/web/components/requests/fields/FcStudyRequestDaysOfWeek.vue';
import SrDayOptionsInput
  from '@/web/components/requests/fields/SrDayOptionsInput.vue';
import FcStudyRequestDuration from '@/web/components/requests/fields/FcStudyRequestDuration.vue';
import FcStudyRequestHours from '@/web/components/requests/fields/FcStudyRequestHours.vue';
import FcStudyRequestNotes from '@/web/components/requests/fields/FcStudyRequestNotes.vue';
import FcStudyRequestStudyType from '@/web/components/requests/fields/FcStudyRequestStudyType.vue';
import { REQUEST_STUDY_TIME_TO_FULFILL } from '@/lib/i18n/Strings';

export default {
  name: 'StudyRequestForm',
  components: {
    FcStudyRequestDaysOfWeek,
    SrDayOptionsInput,
    FcStudyRequestDuration,
    FcStudyRequestHours,
    FcStudyRequestNotes,
    FcStudyRequestStudyType,
  },
  props: {
    v: Object,
    location: Object,
  },
  data() {
    return {
      REQUEST_STUDY_TIME_TO_FULFILL,
    };
  },
  computed: {
    studyType() {
      return this.v.studyType.$model;
    },
    isMultiDayStudy() {
      return this.studyType.isMultiDay;
    },
  },
};
</script>
