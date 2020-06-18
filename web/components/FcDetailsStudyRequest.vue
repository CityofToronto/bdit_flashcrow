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
          v-if="errorMessagesDaysOfWeek.length > 0"
          class="mt-1"
          color="error"
          :value="errorMessagesDaysOfWeek"></v-messages>
        <v-messages
          v-else
          class="mt-1"
          :value="messagesDaysOfWeek"></v-messages>
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
              :max="maxDueDate"
              :min="minDueDate"
              :success="!v.dueDate.$invalid">
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
            :messages="messagesCcEmails"
            :success="internalValue.urgent && !v.ccEmails.$invalid" />
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
        :success="internalValue.urgent && !v.urgentReason.$invalid"
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
    isCreate: Boolean,
    v: Object,
  },
  data() {
    return {
      // CACHED DUE DATES
      dueDate: null,
      dueDateUrgent: null,
      // MESSAGES
      OPTIONAL,
      REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
      REQUEST_STUDY_PROVIDE_URGENT_REASON,
    };
  },
  computed: {
    errorMessagesCcEmails() {
      const errors = [];
      if (!this.v.ccEmails.requiredIfUrgent) {
        errors.push('Please provide an additional point of contact for this urgent request.');
      }
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
        const n = duration / 24;
        const msg = `Please select ${n} consecutive days or reduce study duration.`;
        errors.push(msg);
      }
      return errors;
    },
    errorMessagesDueDate() {
      const errors = [];
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
    maxDueDate() {
      const { now, internalValue: { urgent } } = this;
      if (urgent) {
        return now.plus({ months: 2 });
      }
      return null;
    },
    messagesCcEmails() {
      const { urgent } = this.internalValue;
      if (urgent) {
        return [];
      }
      return [OPTIONAL.text];
    },
    messagesDaysOfWeek() {
      const { duration, studyType } = this.internalValue;
      if (studyType.automatic) {
        const n = duration / 24;
        if (n === 1) {
          return ['The study will be performed on one of these days.'];
        }
        return [`The study will be performed across ${n} consecutive days.`];
      }
      return ['The study will be performed on one of these days.'];
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
        return [];
      }
      return [OPTIONAL.text];
    },
    minDueDate() {
      const { now, internalValue: { urgent } } = this;
      if (urgent) {
        return now.plus({ weeks: 1 });
      }
      return now.plus({ months: 2 });
    },
    ...mapState(['now']),
  },
  watch: {
    'internalValue.studyType.automatic': function watchStudyTypeAutomatic() {
      if (this.internalValue.studyType.automatic) {
        this.internalValue.duration = 24;
        this.internalValue.hours = null;
      } else {
        this.internalValue.duration = null;
        this.internalValue.hours = StudyHours.ROUTINE;
      }
    },
    'internalValue.urgent': function watchUrgent(urgent, urgentPrev) {
      const {
        internalValue: { createdAt, dueDate },
        now,
      } = this;

      // cache existing due date
      if (urgentPrev) {
        this.dueDateUrgent = dueDate;
      } else {
        this.dueDate = dueDate;
      }

      // update due date
      if (urgent) {
        this.internalValue.dueDate = this.dueDateUrgent;
      } else if (this.dueDate === null) {
        /*
         * This happens when an urgent request is loaded, and the user then decides
         * to make it non-urgent.
         *
         * While the current setup *should* guarantee that all newly created requests
         * start as non-urgent, we decide not to depend on that here.
         */
        if (this.isCreate) {
          /*
           * In this case, there is no `createdAt` timestamp yet, so we just set this
           * to 3 months in the future.
           */
          this.internalValue.dueDate = now.plus({ months: 3 });
        } else {
          /*
           * In this case, there is a `createdAt` timestamp, so we use 3 months after
           * that.
           *
           * Note that this can be before the current timestamp!  This is deliberate,
           * to help focus efforts on a 3-month turnaround time.
           */
          this.internalValue.dueDate = createdAt.plus({ months: 3 });
        }
      } else {
        this.internalValue.dueDate = this.dueDate;
      }
    },
  },
};
</script>
