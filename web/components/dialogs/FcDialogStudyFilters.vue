<template>
  <v-dialog
    v-model="internalValue"
    max-width="336"
    scrollable>
    <v-card role="dialog">
      <v-card-title class="shading">
        <h2 class="display-1">Filter Studies</h2>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="default--text">
        <fieldset class="mt-4">
          <legend class="headline">Study Types</legend>

          <v-checkbox
            v-for="studyType in StudyType.enumValues"
            :key="studyType.name"
            v-model="internalFilters.studyTypes"
            class="mt-2"
            hide-details
            :label="studyType.label"
            :value="studyType"></v-checkbox>
        </fieldset>

        <fieldset class="mt-6">
          <legend class="headline">Days of the Week</legend>

          <v-checkbox
            v-for="(label, i) in DAYS_OF_WEEK"
            :key="i"
            v-model="internalFilters.daysOfWeek"
            class="mt-2"
            hide-details
            :label="label"
            :value="i"></v-checkbox>
        </fieldset>

        <fieldset class="mt-6">
          <legend class="headline">Dates</legend>

          <v-checkbox
            v-model="internalFilters.applyDateRange"
            class="mt-2"
            hide-details
            label="Filter by date?"></v-checkbox>
          <FcDatePicker
            v-model="$v.internalFilters.dateRangeStart.$model"
            class="mt-2"
            :disabled="!internalFilters.applyDateRange"
            :error-messages="errorMessagesDateRangeStart"
            hide-details="auto"
            label="From (YYYY-MM-DD)"
            :max="now">
          </FcDatePicker>
          <FcDatePicker
            v-model="$v.internalFilters.dateRangeEnd.$model"
            class="mt-2"
            :disabled="!internalFilters.applyDateRange"
            :error-messages="errorMessagesDateRangeEnd"
            hide-details="auto"
            label="To (YYYY-MM-DD)"
            :max="now">
          </FcDatePicker>
        </fieldset>

        <fieldset class="mt-6">
          <legend class="headline">Hours</legend>

          <v-checkbox
            v-for="studyHours in StudyHours.enumValues"
            :key="studyHours.name"
            v-model="internalFilters.hours"
            class="mt-2"
            hide-details
            :label="studyHours.description"
            :value="studyHours"></v-checkbox>
        </fieldset>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.internalFilters.$invalid"
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex';

import {
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';
import ValidationsFilters from '@/lib/validation/ValidationsFilters';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogStudyFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcDatePicker,
  },
  props: {
    filters: Object,
  },
  data() {
    return {
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
      internalFilters: { ...this.filters },
      StudyHours,
      StudyType,
    };
  },
  computed: {
    errorMessagesDateRangeStart() {
      const errors = [];
      if (!this.$v.internalFilters.dateRangeStart.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    errorMessagesDateRangeEnd() {
      const errors = [];
      if (!this.$v.internalFilters.dateRangeEnd.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    ...mapState(['now']),
  },
  validations: {
    internalFilters: ValidationsFilters,
  },
  methods: {
    actionClearAll() {
      this.internalFilters = {
        applyDateRange: false,
        dateRangeStart: null,
        dateRangeEnd: null,
        daysOfWeek: [],
        hours: [],
        studyTypes: [],
      };
    },
    actionSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
