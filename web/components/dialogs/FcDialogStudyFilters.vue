<template>
  <v-dialog
    v-model="internalValue"
    max-width="300"
    scrollable>
    <template v-slot:activator="{ on }">
      <slot name="activator" v-bind="{ on }"></slot>
    </template>
    <v-card>
      <v-card-title>Filter</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <h2 class="subtitle-2 mt-4">Study Types</h2>
        <v-checkbox
          v-for="{ label, value } in COUNT_TYPES"
          :key="value"
          v-model="internalStudyTypes"
          class="mt-2"
          hide-details
          :label="label"
          :value="value"></v-checkbox>

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
          v-for="{ description, name } in StudyHours.enumValues"
          :key="name"
          v-model="internalHours"
          class="mt-2"
          hide-details
          :label="description"
          :value="name"></v-checkbox>
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
  COUNT_TYPES,
  StudyHours,
} from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';

export default {
  name: 'FcDialogStudyFilters',
  props: {
    datesFrom: Number,
    daysOfWeek: Array,
    hours: Array,
    studyTypes: Array,
    value: Boolean,
  },
  data() {
    return {
      COUNT_TYPES,
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
      internalDatesFrom: this.datesFrom,
      internalDaysOfWeek: this.daysOfWeek,
      internalHours: this.hours,
      internalStudyTypes: this.studyTypes,
      StudyHours,
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
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
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
