<template>
  <section class="d-flex flex-column min-height-fill max-height-fill">
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <section class="pa-5">
        <v-messages
          :value="[REQUEST_STUDY_TIME_TO_FULFILL.text]"></v-messages>

        <div class="mt-4">
          <h2 class="headline">Study Type</h2>
          <v-row>
            <v-col cols="8">
              <FcStudyRequestStudyType :v="$v.internalValue" />
            </v-col>
          </v-row>
        </div>

        <div class="mt-4">
          <h2 class="headline">Reason for Request</h2>
          <v-row>
            <v-col cols="8">
              <FcSelectEnum
                v-model="$v.internalValue.reason.$model"
                :error-messages="errorMessagesReason"
                hide-details="auto"
                label="Reason"
                :of-type="StudyRequestReason"
                outlined />
            </v-col>
          </v-row>
        </div>

        <div
          v-if="internalValue.reason === StudyRequestReason.OTHER"
          class="mt-4">
          <v-row>
            <v-col cols="8">
              <v-text-field
                v-model="$v.internalValue.reasonOther.$model"
                :error-messages="errorMessagesReasonOther"
                hide-details="auto"
                label="Other Reason"
                outlined
                :success="internalValue.reasonOther && !$v.internalValue.reasonOther.$invalid" />
            </v-col>
          </v-row>
        </div>
      </section>
      <template v-if="internalValue.studyType">
        <v-divider></v-divider>

        <section class="pa-5 shading">
          <h2 class="display-1">{{internalValue.studyType.label}}</h2>

          <div class="mt-4">
            <h3 class="headline">Study Days</h3>
            <v-row>
              <v-col cols="8">
                <FcStudyRequestDaysOfWeek :v="$v.internalValue" />
              </v-col>
            </v-row>
          </div>

          <div class="mt-4">
            <template v-if="internalValue.studyType.automatic">
              <h3 class="headline">Study Duration</h3>
              <v-row>
                <v-col cols="8">
                  <FcStudyRequestDuration :v="$v.internalValue" />
                </v-col>
              </v-row>
            </template>
            <template v-else>
              <h3 class="headline">Study Hours</h3>
              <v-row>
                <v-col cols="8">
                  <FcStudyRequestHours :v="$v.internalValue" />
                </v-col>
              </v-row>
            </template>
          </div>

          <FcStudyRequestNotes
            class="mt-4"
            :v="$v.internalValue" />
        </section>
      </template>

      <v-divider></v-divider>

      <section class="pa-5">
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
                  hide-details="auto"
                  label="Due Date"
                  :max="maxDueDate"
                  :min="minDueDate"
                  :success="!$v.internalValue.dueDate.$invalid">
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
                :success="internalValue.urgent && !$v.internalValue.ccEmails.$invalid" />
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
            :success="internalValue.urgent && !$v.internalValue.urgentReason.$invalid"
            @blur="$v.internalValue.urgentReason.$touch()"></v-textarea>
        </div>
      </section>
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

import {
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import {
  OPTIONAL,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK,
  REQUEST_STUDY_REQUIRES_REASON,
  REQUEST_STUDY_REQUIRES_REASON_OTHER,
  REQUEST_STUDY_TIME_TO_FULFILL,
} from '@/lib/i18n/Strings';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';
import FcStudyRequestDaysOfWeek
  from '@/web/components/requests/fields/FcStudyRequestDaysOfWeek.vue';
import FcStudyRequestDuration from '@/web/components/requests/fields/FcStudyRequestDuration.vue';
import FcStudyRequestHours from '@/web/components/requests/fields/FcStudyRequestHours.vue';
import FcStudyRequestNotes from '@/web/components/requests/fields/FcStudyRequestNotes.vue';
import FcStudyRequestStudyType from '@/web/components/requests/fields/FcStudyRequestStudyType.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudyRequest',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcDatePicker,
    FcInputTextArray,
    FcSelectEnum,
    FcStudyRequestDaysOfWeek,
    FcStudyRequestDuration,
    FcStudyRequestHours,
    FcStudyRequestNotes,
    FcStudyRequestStudyType,
  },
  props: {
    isCreate: Boolean,
    location: Object,
  },
  data() {
    return {
      // CACHED DUE DATES
      dueDate: null,
      dueDateUrgent: null,
      // MESSAGES
      OPTIONAL,
      reasonOther: null,
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
    errorMessagesReason() {
      const errors = [];
      if (!this.$v.internalValue.reason.required) {
        errors.push(REQUEST_STUDY_REQUIRES_REASON.text);
      }
      return errors;
    },
    errorMessagesReasonOther() {
      const errors = [];
      if (!this.$v.internalValue.reasonOther.requiredIfOtherReason) {
        errors.push(REQUEST_STUDY_REQUIRES_REASON_OTHER.text);
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
      if (this.internalValue === null) {
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
    'internalValue.reason': function watchReason() {
      if (this.internalValue.reasonOther === StudyRequestReason.OTHER) {
        this.internalValue.reasonOther = this.reasonOther;
      } else {
        this.reasonOther = this.internalValue.reasonOther;
        this.internalValue.reasonOther = null;
      }
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
      const { now } = this;

      // cache existing due date
      if (urgentPrev) {
        this.dueDateUrgent = this.internalValue.dueDate;
      } else {
        this.dueDate = this.internalValue.dueDate;
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
          this.internalValue.dueDate = this.internalValue.createdAt.plus({ months: 3 });
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
