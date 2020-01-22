<template>
  <v-card
    class="mb-3 pa-3"
    outlined>
    <v-card-title>
      {{studyType.label}}
    </v-card-title>
    <v-card-text>
      <div class="mb-4">
        <strong>What days of the week should the study fall on? *</strong>
        <v-row class="pl-1">
          <v-checkbox
            v-for="(label, i) in DAYS_OF_WEEK"
            :key="i"
            v-model="v.daysOfWeek.$model"
            class="mx-2"
            :error-messages="errorMessagesDaysOfWeek"
            hide-details
            :label="label"
            :value="i"></v-checkbox>
        </v-row>
        <v-messages
          class="mt-1"
          color="error"
          :value="errorMessagesDaysOfWeek"></v-messages>
      </div>
      <div v-if="studyType.automatic" class="mb-4">
        <strong>What's the duration of your study? *</strong>
        <TdsRadioGroup
          v-model="v.duration.$model"
          :error-messages="errorMessagesDuration"
          :options="[
            { label: '1 day', sublabel: '24 hours', value: 24 },
            { label: '2 days', sublabel: '48 hours', value: 48 },
            { label: '3 days', sublabel: '72 hours', value: 72 },
            { label: '4 days', sublabel: '96 hours', value: 96 },
            { label: '5 days', sublabel: '120 hours', value: 120 },
            { label: '1 week', sublabel: '168 hours', value: 168 },
          ]" />
      </div>
      <div v-else class="mb-4">
        <strong>What type of hours should we use? *</strong>
        <TdsRadioGroup
          v-model="internalValue.hours"
          class="mb-2"
          :messages="messagesHours"
          :options="[
            { label: 'School', value: 'SCHOOL' },
            { label: 'Routine', value: 'ROUTINE' },
            { label: 'Other', value: 'OTHER' },
          ]" />
      </div>
      <strong>Any additional notes you'd like to share?</strong>
      <v-textarea
        v-model="v.notes.$model"
        ref="notes"
        :error-messages="errorMessagesNotes"
        filled
        no-resize
        rows="4"
        @blur="v.notes.$touch()"></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-if="studyType.automatic"
        text
        @click="$emit('set-study-location')">
        Set Location
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        text
        @click="$emit('remove-study')">
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { CountHours, COUNT_TYPES } from '@/lib/Constants';
import {
  STUDY_OTHER_HOURS_REQUIRES_NOTES,
  STUDY_REQUIRES_DAYS_OF_WEEK,
} from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import TdsRadioGroup from '@/web/components/tds/TdsRadioGroup.vue';

export default {
  name: 'FcDetailsStudy',
  components: {
    TdsRadioGroup,
  },
  props: {
    v: Object,
    value: Object,
  },
  data() {
    const { DAYS_OF_WEEK } = TimeFormatters;
    return {
      DAYS_OF_WEEK,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    errorMessagesDaysOfWeek() {
      const errors = [];
      if (!this.v.daysOfWeek.$dirty) {
        return errors;
      }
      if (!this.v.daysOfWeek.required) {
        errors.push(STUDY_REQUIRES_DAYS_OF_WEEK.text);
      }
      return errors;
    },
    errorMessagesDuration() {
      const errors = [];
      if (!this.v.duration.$dirty) {
        return errors;
      }
      const { duration } = this.internalValue;
      if (!this.v.duration.needsValidDaysOfWeek) {
        const days = duration / 24;
        const msg = `Please select ${days} consecutive days or reduce study duration.`;
        errors.push(msg);
      }
      return errors;
    },
    errorMessagesNotes() {
      const errors = [];
      if (!this.v.notes.$dirty) {
        return errors;
      }
      if (!this.v.notes.requiredIfOtherHours) {
        errors.push(STUDY_OTHER_HOURS_REQUIRES_NOTES.text);
      }
      return errors;
    },
    messagesHours() {
      const { hours } = this.internalValue;
      if (hours !== 'SCHOOL' && hours !== 'ROUTINE') {
        return [];
      }
      const countHoursParts = CountHours[hours].map(
        ([start, end]) => `${start}\u2013${end}`,
      );
      const countHoursMessage = countHoursParts.join(', ');
      return [countHoursMessage];
    },
    studyType() {
      const { studyType } = this.internalValue;
      return COUNT_TYPES.find(({ value }) => value === studyType);
    },
  },
};
</script>
