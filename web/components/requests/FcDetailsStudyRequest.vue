<template>
  <section class="d-flex flex-column max-height-fill">
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto pa-5">
      <v-messages
        :value="[REQUEST_STUDY_TIME_TO_FULFILL.text]"></v-messages>

      <div class="mt-4">
        <h2 class="headline">Study Type</h2>
        <v-row>
          <v-col cols="8">
            <FcSelectEnum
              v-model="$v.internalValue.studyType.$model"
              hide-details
              item-text="label"
              label="Study Type"
              :of-type="StudyType"
              outlined />
          </v-col>
        </v-row>
        <v-messages
          v-if="errorMessagesStudyType.length > 0"
          class="mt-1"
          color="error"
          :value="errorMessagesStudyType" />
      </div>

      <div class="mt-4">
        <h2 class="headline">Reason for Request</h2>
        <v-row>
          <v-col cols="8">
            <FcSelectEnum
              v-model="$v.internalValue.reason.$model"
              hide-details
              label="Reason"
              :of-type="StudyRequestReason"
              outlined />
          </v-col>
        </v-row>
        <v-messages
          v-if="errorMessagesReason.length > 0"
          class="mt-1"
          color="error"
          :value="errorMessagesReason" />
      </div>

      <template v-if="internalValue.studyType">
        <v-divider class="my-3"></v-divider>

        <h2 class="display-1">{{internalValue.studyType.label}}</h2>

        <div class="mt-4">
          <h3 class="headline">Study Days</h3>
          <FcCheckboxGroupChips
            v-model="$v.internalValue.daysOfWeek.$model"
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
            v-model="$v.internalValue.duration.$model"
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
          v-model="$v.internalValue.notes.$model"
          class="mt-4"
          :error-messages="errorMessagesNotes"
          label="Additional Information"
          :messages="messagesNotes"
          no-resize
          outlined
          rows="4"
          @blur="$v.internalValue.notes.$touch()"></v-textarea>
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
                v-model="$v.internalValue.dueDate.$model"
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
              v-model="$v.internalValue.ccEmails.$model"
              :error-messages="errorMessagesCcEmails"
              label="Staff Email"
              :messages="messagesCcEmails"
              :success="internalValue.urgent && !v.ccEmails.$invalid" />
          </v-col>
        </v-row>
      </div>

      <div class="mt-4">
        <v-textarea
          v-model="$v.internalValue.urgentReason.$model"
          class="mt-3"
          :error-messages="errorMessagesUrgentReason"
          label="Additional Information"
          :messages="messagesUrgentReason"
          no-resize
          outlined
          rows="4"
          :success="internalValue.urgent && !v.urgentReason.$invalid"
          @blur="$v.internalValue.urgentReason.$touch()"></v-textarea>
      </div>
    </section>

    <v-divider></v-divider>

    <footer class="flex-grow-0 flex-shrink-0">
      <div class="align-center d-flex px-3 py-2">
        <v-spacer></v-spacer>
        <FcButton
          class="mr-2"
          type="tertiary"
          @click="$emit('action-navigate-back')">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.internalValue.$invalid"
          type="primary"
          @click="actionSubmit">
          <span v-if="isCreate">Submit</span>
          <span v-else>Save</span>
        </FcButton>
      </div>
    </footer>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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
  REQUEST_STUDY_REQUIRES_REASON,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
  REQUEST_STUDY_TIME_TO_FULFILL,
} from '@/lib/i18n/Strings';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcCheckboxGroupChips from '@/web/components/inputs/FcCheckboxGroupChips.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudyRequest',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcCheckboxGroupChips,
    FcDatePicker,
    FcInputTextArray,
    FcRadioGroup,
    FcSelectEnum,
  },
  props: {
    isCreate: Boolean,
    location: Object,
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
      REQUEST_STUDY_TIME_TO_FULFILL,
      StudyRequestReason,
      StudyType,
    };
  },
  computed: {
    errorMessagesCcEmails() {
      const errors = [];
      if (!this.$v.internalValue.ccEmails.requiredIfUrgent) {
        errors.push('Please provide an additional point of contact for this urgent request.');
      }
      this.internalValue.ccEmails.forEach((_, i) => {
        if (!this.$v.internalValue.ccEmails.$each[i].$dirty) {
          return;
        }
        if (!this.$v.internalValue.ccEmails.$each[i].required) {
          errors.push('Please enter a value.');
        }
        if (!this.$v.internalValue.ccEmails.$each[i].torontoInternal) {
          errors.push('Please enter a valid @toronto.ca email address.');
        }
      });
      return errors;
    },
    errorMessagesDaysOfWeek() {
      const errors = [];
      if (!this.$v.internalValue.daysOfWeek.$dirty && !this.$v.internalValue.duration.$dirty) {
        return errors;
      }
      if (!this.$v.internalValue.daysOfWeek.required) {
        errors.push(REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK.text);
      }
      const { duration } = this.internalValue;
      if (!this.$v.internalValue.duration.needsValidDaysOfWeek) {
        const n = duration / 24;
        const msg = `Please select ${n} consecutive days or reduce study duration.`;
        errors.push(msg);
      }
      return errors;
    },
    errorMessagesDueDate() {
      const errors = [];
      if (!this.$v.internalValue.dueDate.required) {
        errors.push(REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE.text);
      }
      return errors;
    },
    errorMessagesNotes() {
      const errors = [];
      if (!this.$v.internalValue.notes.$dirty) {
        return errors;
      }
      if (!this.$v.internalValue.notes.requiredIfOtherHours) {
        errors.push(REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES.text);
      }
      return errors;
    },
    errorMessagesReason() {
      const errors = [];
      if (!this.$v.internalValue.reason.required) {
        errors.push(REQUEST_STUDY_REQUIRES_REASON.text);
      }
      return errors;
    },
    errorMessagesStudyType() {
      const errors = [];
      if (!this.$v.internalValue.studyType.required) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDY_TYPE.text);
      }
      return errors;
    },
    errorMessagesUrgentReason() {
      const errors = [];
      if (!this.$v.internalValue.urgentReason.requiredIfUrgent) {
        errors.push(REQUEST_STUDY_PROVIDE_URGENT_REASON.text);
      }
      return errors;
    },
    estimatedDeliveryDate() {
      const { internalValue, now } = this;
      if (internalValue === null) {
        return null;
      }
      const { dueDate, urgent } = internalValue;
      if (dueDate === null) {
        return null;
      }
      if (urgent) {
        return dueDate;
      }
      return DateTime.max(
        dueDate.minus({ weeks: 1 }),
        now.plus({ months: 2 }),
      );
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
  validations: {
    internalValue: ValidationsStudyRequest,
  },
  watch: {
    estimatedDeliveryDate() {
      this.internalValue.estimatedDeliveryDate = this.estimatedDeliveryDate;
    },
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
  methods: {
    actionSubmit() {
      this.saveStudyRequest(this.internalValue);
      this.$emit('action-navigate-back', true);
    },
    ...mapActions(['saveStudyRequest']),
  },
};
</script>
