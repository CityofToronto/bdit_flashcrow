<template>
  <v-dialog
    v-model="internalValue"
    max-width="300"
    scrollable>
    <v-card>
      <v-card-title>Filter</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <h2 class="subtitle-2 mt-4">Study Types</h2>
        <v-checkbox
          v-for="studyType in StudyType.enumValues"
          :key="studyType.name"
          v-model="internalStudyTypes"
          class="mt-2"
          hide-details
          :label="studyType.label"
          :value="studyType"></v-checkbox>

        <h2 class="mt-4 subtitle-2">Days of the Week</h2>
        <v-checkbox
          v-for="(label, i) in DAYS_OF_WEEK"
          :key="i"
          v-model="internalDaysOfWeek"
          class="mt-2"
          hide-details
          :label="label"
          :value="i"></v-checkbox>

        <h2 class="mt-4 subtitle-2">Dates from</h2>
        <v-radio-group
          v-model="internalDatesFrom"
          class="mt-2"
          hide-details>
          <v-radio label="3 years" :value="3"></v-radio>
          <v-radio label="5 years" :value="5"></v-radio>
          <v-radio label="10 years" :value="10"></v-radio>
          <v-radio label="All" :value="-1"></v-radio>
        </v-radio-group>

        <h2 class="mt-4 subtitle-2">Hours</h2>
        <v-checkbox
          v-for="studyHours in StudyHours.enumValues"
          :key="studyHours.name"
          v-model="internalHours"
          class="mt-2"
          hide-details
          :label="studyHours.description"
          :value="studyHours"></v-checkbox>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="internalValue = false">Cancel</v-btn>
        <v-btn
          color="primary"
          text
          @click="onClickSave">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogStudyFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  props: {
    datesFrom: Number,
    daysOfWeek: Array,
    hours: Array,
    studyTypes: Array,
  },
  data() {
    return {
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
      internalDatesFrom: this.datesFrom,
      internalDaysOfWeek: this.daysOfWeek,
      internalHours: this.hours,
      internalStudyTypes: this.studyTypes,
      StudyHours,
      StudyType,
    };
  },
  computed: {
    internalFilters() {
      return {
        datesFrom: this.internalDatesFrom,
        daysOfWeek: this.internalDaysOfWeek,
        hours: this.internalHours,
        studyTypes: this.internalStudyTypes,
      };
    },
  },
  methods: {
    onClickSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
