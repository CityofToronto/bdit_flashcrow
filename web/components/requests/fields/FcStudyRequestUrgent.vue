<template>
  <div>
    <h3 class="headline">Escalate Priority</h3>
    <v-checkbox
      v-model="v.urgent.$model"
      class="mt-1"
      label="Urgent"
      :messages="[OPTIONAL.text]" />
    <template v-if="v.urgent.$model">
      <v-row>
        <v-col cols="8">
          <FcDatePicker
            v-model="v.dueDate.$model"
            class="mt-3"
            :error-messages="errorMessagesDueDate"
            hide-details="auto"
            label="Due Date (MM/DD/YYYY)"
            :max="maxDueDate"
            :min="minDueDate"
            outlined
            :success="!v.dueDate.$invalid">
          </FcDatePicker>
        </v-col>
      </v-row>
    </template>

    <div class="mt-4">
      <h3 class="headline">Inform Other Staff</h3>
      <v-row>
        <v-col cols="8">
          <FcInputTextArray
            v-model="v.ccEmails.$model"
            :error-messages="errorMessagesCcEmails"
            label="Staff Email"
            :messages="messagesCcEmails"
            :success="v.urgent.$model && !v.ccEmails.$invalid" />
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
        :success="v.urgent.$model && !v.urgentReason.$invalid"
        @blur="v.urgentReason.$touch()"></v-textarea>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import {
  OPTIONAL,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
} from '@/lib/i18n/Strings';
import DateTime from '@/lib/time/DateTime';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';

export default {
  name: 'FcStudyRequestUrgent',
  components: {
    FcDatePicker,
    FcInputTextArray,
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
    };
  },
  computed: {
    errorMessagesCcEmails() {
      const errors = [];
      if (!this.v.ccEmails.requiredIfUrgent) {
        errors.push('Please provide an additional point of contact for this urgent request.');
      }
      this.v.ccEmails.$model.forEach((_, i) => {
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
    errorMessagesDueDate() {
      const errors = [];
      if (!this.v.dueDate.required) {
        errors.push(REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE.text);
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
    estimatedDeliveryDate() {
      const { now } = this;
      const dueDate = this.v.dueDate.$model;
      if (dueDate === null) {
        return null;
      }
      const urgent = this.v.urgent.$model;
      if (urgent) {
        return dueDate;
      }
      return DateTime.max(
        dueDate.minus({ weeks: 1 }),
        now.plus({ months: 2 }),
      );
    },
    maxDueDate() {
      const { now } = this;
      const urgent = this.v.urgent.$model;
      if (urgent) {
        return now.plus({ months: 2 });
      }
      return null;
    },
    messagesCcEmails() {
      const urgent = this.v.urgent.$model;
      if (urgent) {
        return [];
      }
      return [OPTIONAL.text];
    },
    messagesUrgentReason() {
      const urgent = this.v.urgent.$model;
      if (urgent) {
        return [];
      }
      return [OPTIONAL.text];
    },
    minDueDate() {
      const { now } = this;
      const urgent = this.v.urgent.$model;
      if (urgent) {
        return now.plus({ weeks: 1 });
      }
      return now.plus({ months: 2 });
    },
    ...mapState(['now']),
  },
  watch: {
    estimatedDeliveryDate: {
      handler() {
        this.v.estimatedDeliveryDate.$model = this.estimatedDeliveryDate;
      },
      immediate: true,
    },
    'v.urgent.$model': function watchUrgent(urgent, urgentPrev) {
      const { now } = this;

      // cache existing due date
      const dueDate = this.v.dueDate.$model;
      if (urgentPrev) {
        this.dueDateUrgent = dueDate;
      } else {
        this.dueDate = dueDate;
      }

      // update due date
      if (urgent) {
        this.v.dueDate.$model = this.dueDateUrgent;
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
          this.v.dueDate.$model = now.plus({ months: 3 });
        } else {
          /*
           * In this case, there is a `createdAt` timestamp, so we use 3 months after
           * that.
           *
           * Note that this can be before the current timestamp!  This is deliberate,
           * to help focus efforts on a 3-month turnaround time.
           */
          const createdAt = this.v.createdAt.$model;
          this.v.dueDate.$model = createdAt.plus({ months: 3 });
        }
      } else {
        this.v.dueDate.$model = this.dueDate;
      }
    },
  },
};
</script>
