<template>
  <v-dialog
    v-model="internalValue"
    max-width="336"
    scrollable>
    <v-card>
      <v-card-title>
        <h1 class="headline">Filter</h1>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <h2 class="body-1 mt-4">Study Types</h2>
        <v-checkbox
          v-for="studyType in StudyType.enumValues"
          :key="studyType.name"
          v-model="internalStudyTypes"
          class="mt-2"
          hide-details
          :label="studyType.label"
          :value="studyType"></v-checkbox>

        <h2 class="body-1 mt-4">Days of the Week</h2>
        <v-checkbox
          v-for="(label, i) in DAYS_OF_WEEK"
          :key="i"
          v-model="internalDaysOfWeek"
          class="mt-2"
          hide-details
          :label="label"
          :value="i"></v-checkbox>

        <h2 class="body-1 mt-4">Dates from</h2>
        <FcRadioGroup
          v-model="internalDatesFrom"
          class="mt-2"
          hide-details
          :items="[
            { label: '3 years', value: 3 },
            { label: '5 years', value: 5 },
            { label: '10 years', value: 10 },
            { label: 'All', value: -1 },
          ]">
        </FcRadioGroup>

        <h2 class="body-1 mt-4">Hours</h2>
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
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          Cancel
        </FcButton>
        <FcButton
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
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
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogStudyFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcRadioGroup,
  },
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
    actionClearAll() {
      this.internalDatesFrom = -1;
      this.internalDaysOfWeek = [];
      this.internalHours = [];
      this.internalStudyTypes = [];
    },
    actionSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
