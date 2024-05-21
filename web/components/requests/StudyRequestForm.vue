<template>
  <fieldset>
    <legend class="sr-only">Study Type for Request</legend>
    <v-row class="mt-0">
      <v-col class="my-1 py-2" cols="6">
        <FcStudyRequestStudyType
          ref="autofocus"
          dense
          :location="location"
          :v="v" />
      </v-col>
      <v-col class="my-1 py-2" cols="6">
        <FcStudyRequestDuration
          dense
          :v="v" />
      </v-col>
    </v-row>
    <v-row class="mt-0" v-if="isMultiDayStudy">
      <v-col class="my-0 py-2" cols="12">
        <FcStudyRequestDaysOfWeek
          dense
          :v="v" />
      </v-col>
    </v-row>
    <v-row class="mt-1" v-else>
      <v-col class="my-0 py-2 day-request" cols="6">
        <SrDayOptionsInput
          dense
          :v="v"
        />
      </v-col>
      <v-col class="my-0 py-2" cols="6">
        <FcStudyRequestHours
          dense
          :v="v" />
      </v-col>
    </v-row>
    <v-row class="mt-5">
      <v-col class="my-0 pt-0 collection-notes" cols="12">
        <FcStudyRequestNotes :v="v" :key="componentKey" />
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
import { StudyHours, StudyType, CentrelineType } from '@/lib/Constants';

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
      componentKey: 0,
    };
  },
  computed: {
    studyType: {
      get() {
        return this.v.studyType.$model;
      },
      set(type) {
        this.v.studyType.$model = type;
      },
    },
    isMultiDayStudy() {
      return this.studyType.isMultiDay;
    },
  },
  methods: {
    resetHoursValue() {
      let value = null;
      if (!this.isMultiDayStudy) {
        value = StudyHours[this.studyType.hourOptions[0]];
      }
      this.v.hours.$model = value;
    },
    resetStudyType(centrelineType) {
      let studyType;
      if (centrelineType === CentrelineType.INTERSECTION) {
        studyType = StudyType.TMC;
      } else {
        studyType = StudyType.ATR_SVC;
      }
      this.studyType = studyType;
    },
  },
  watch: {
    isMultiDayStudy(newVal) {
      this.v.duration.$model = (newVal ? 72 : 24);
      this.v.daysOfWeek.$model = [2, 3, 4];
    },
    'v.hours.$model': function watchHour() {
      this.componentKey += 1;
    },
  },
};
</script>

<style>
.collection-notes textarea {
  margin: 14px 0 10px 0 !important;
  line-height: 1.4rem;
}

.day-request {
  min-height: 6rem;
}
</style>
