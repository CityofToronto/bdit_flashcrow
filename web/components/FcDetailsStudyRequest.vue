<template>
  <section>
    <div class="mt-4">
      <FcRadioGroup
        v-model="v.studyType.$model"
        hide-details
        :items="itemsStudyType">
        <template v-slot:legend>
          <h2 class="headline">Study Type</h2>
        </template>
      </FcRadioGroup>
      <v-messages
        class="mt-1"
        color="error"
        :value="errorMessagesStudyType"></v-messages>
    </div>

    <div class="mt-4">
      <h3 class="headline">311 Information</h3>
      <v-row>
        <v-col cols="8">
          <v-text-field
            v-model="internalValue.serviceRequestId"
            label="Service Number"
            :messages="[OPTIONAL.text]"
            outlined>
          </v-text-field>
        </v-col>
      </v-row>
    </div>

    <div class="mt-4">
      <h3 class="headline">Reasons</h3>
      <FcCheckboxGroupChips
        v-model="v.reasons.$model"
        :items="itemsReasons"></FcCheckboxGroupChips>
      <v-messages
        class="mt-1"
        color="error"
        :value="errorMessagesReasons"></v-messages>
    </div>

    <template v-if="internalValue.studyType">
      <v-divider class="my-3"></v-divider>

      <h2 class="display-1">{{internalValue.studyType.label}}</h2>

      <div class="mt-4">
        <h3 class="headline">Study Days</h3>
        <FcCheckboxGroupChips
          v-model="v.daysOfWeek.$model"
          :items="itemsDaysOfWeek"></FcCheckboxGroupChips>
        <v-messages
          class="mt-1"
          color="error"
          :value="errorMessagesDaysOfWeek"></v-messages>
      </div>

      <div v-if="internalValue.studyType.automatic" class="mt-4">
        <FcRadioGroup
          v-model="v.duration.$model"
          :items="[
            { label: '1 day', sublabel: '24 hours', value: 24 },
            { label: '2 days', sublabel: '48 hours', value: 48 },
            { label: '3 days', sublabel: '72 hours', value: 72 },
            { label: '4 days', sublabel: '96 hours', value: 96 },
            { label: '5 days', sublabel: '120 hours', value: 120 },
            { label: '1 week', sublabel: '168 hours', value: 168 },
          ]">
          <template v-slot:legend>
            <h3 class="headline">Study Duration</h3>
          </template>
        </FcRadioGroup>
      </div>
      <div
        v-else
        class="mt-4">
        <FcRadioGroup
          v-model="internalValue.hours"
          hide-details
          :items="itemsHours">
          <template v-slot:legend>
            <h3 class="headline">Study Hours</h3>
          </template>
        </FcRadioGroup>
      </div>

      <v-textarea
        v-model="v.notes.$model"
        class="mt-4"
        :error-messages="errorMessagesNotes"
        label="Additional Information"
        :messages="messagesNotes"
        no-resize
        outlined
        rows="4"
        @blur="v.notes.$touch()"></v-textarea>
    </template>

    <v-divider class="my-3"></v-divider>

    <div class="mt-4">
      <h3 class="headline">Escalate Priority</h3>
      <v-checkbox
        v-model="internalValue.urgent"
        class="mt-1"
        label="Urgent"
        :messages="[OPTIONAL.text]" />
      <template v-if="internalValue.urgent">
        <v-row>
          <v-col cols="8">
            <FcDatePicker
              v-model="v.dueDate.$model"
              class="mt-3"
              :error-messages="errorMessagesDueDate"
              label="Due Date"
              :messages="[REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE.text]"
              :min="minDueDate">
            </FcDatePicker>
          </v-col>
        </v-row>
      </template>
    </div>

    <div class="mt-4">
      <h3 class="headline">Inform Other Staff</h3>
      <v-row>
        <v-col cols="8">
          <FcInputTextArray
            v-model="v.ccEmails.$model"
            :error-messages="errorMessagesCcEmails"
            label="Staff Email"
            :messages="[OPTIONAL.text]" />
        </v-col>
      </v-row>
    </div>

    <div class="mt-4">
      <v-textarea
        v-model="v.urgentReason.$model"
        class="mt-3"
        :error-messages="errorMessagesUrgentReason"
        label="Additional Information"
        :messages="messagesUrgentReason"
        no-resize
        outlined
        rows="4"
        @blur="v.urgentReason.$touch()"></v-textarea>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import {
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import {
  OPTIONAL,
  REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK,
  REQUEST_STUDY_REQUIRES_REASONS,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
} from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcCheckboxGroupChips from '@/web/components/inputs/FcCheckboxGroupChips.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudyRequest',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcCheckboxGroupChips,
    FcDatePicker,
    FcInputTextArray,
    FcRadioGroup,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      OPTIONAL,
      REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
      REQUEST_STUDY_PROVIDE_URGENT_REASON,
    };
  },
  computed: {
    errorMessagesCcEmails() {
      const errors = [];
      this.internalValue.ccEmails.forEach((_, i) => {
        if (!this.v.ccEmails.$each[i].$dirty) {
          return;
        }
        if (!this.v.ccEmails.$each[i].required) {
          errors.push('Please enter a value.');
        }
        if (!this.v.ccEmails.$each[i].torontoInternal) {
          errors.push('Please enter a valid @toronto.ca email address.');
        }
      });
      return errors;
    },
    errorMessagesDaysOfWeek() {
      const errors = [];
      if (!this.v.daysOfWeek.$dirty && !this.v.duration.$dirty) {
        return errors;
      }
      if (!this.v.daysOfWeek.required) {
        errors.push(REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK.text);
      }
      const { duration } = this.internalValue;
      if (!this.v.duration.needsValidDaysOfWeek) {
        const days = duration / 24;
        const msg = `Please select ${days} consecutive days or reduce study duration.`;
        errors.push(msg);
      }
      return errors;
    },
    errorMessagesDueDate() {
      const errors = [];
      if (!this.v.dueDate.$dirty) {
        return errors;
      }
      if (!this.v.dueDate.required) {
        errors.push(REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE.text);
      }
      return errors;
    },
    errorMessagesNotes() {
      const errors = [];
      if (!this.v.notes.$dirty) {
        return errors;
      }
      if (!this.v.notes.requiredIfOtherHours) {
        errors.push(REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES.text);
      }
      return errors;
    },
    errorMessagesReasons() {
      const errors = [];
      if (!this.v.reasons.$dirty) {
        return errors;
      }
      if (!this.v.reasons.required) {
        errors.push(REQUEST_STUDY_REQUIRES_REASONS.text);
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
    errorMessagesUrgentReason() {
      const errors = [];
      if (!this.v.urgentReason.$dirty) {
        return errors;
      }
      if (!this.v.urgentReason.requiredIfUrgent) {
        errors.push(REQUEST_STUDY_PROVIDE_URGENT_REASON.text);
      }
      return errors;
    },
    itemsDaysOfWeek() {
      return TimeFormatters.DAYS_OF_WEEK.map((text, value) => ({ text, value }));
    },
    itemsHours() {
      return StudyHours.enumValues.map((value) => {
        const { hint, description: label } = value;
        return { hint, label, value };
      });
    },
    itemsReasons() {
      const itemsReasons = StudyRequestReason.enumValues.map((value) => {
        const { text } = value;
        return { text, value };
      });
      return ArrayUtils.sortBy(itemsReasons, ({ text }) => text);
    },
    itemsStudyType() {
      const itemsStudyType = StudyType.enumValues.map((studyType) => {
        const { label } = studyType;
        return { label, value: studyType };
      });
      return ArrayUtils.sortBy(itemsStudyType, ({ label }) => label);
    },
    messagesNotes() {
      const { hours } = this.internalValue;
      if (hours === StudyHours.OTHER) {
        return [];
      }
      return [OPTIONAL.text];
    },
    messagesUrgentReason() {
      const { urgent } = this.internalValue;
      if (urgent) {
        return [REQUEST_STUDY_PROVIDE_URGENT_REASON.text];
      }
      return [OPTIONAL.text];
    },
    minDueDate() {
      const { now, internalValue: { urgent } } = this;
      if (urgent) {
        return now;
      }
      return now.plus({ months: 2 });
    },
    ...mapState(['now']),
  },
  watch: {
    'internalValue.studyType.automatic': function studyTypeAutomatic() {
      if (this.internalValue.studyType.automatic) {
        this.internalValue.duration = 24;
        this.internalValue.hours = null;
      } else {
        this.internalValue.duration = null;
        this.internalValue.hours = StudyHours.ROUTINE;
      }
    },
  },
};
</script>
