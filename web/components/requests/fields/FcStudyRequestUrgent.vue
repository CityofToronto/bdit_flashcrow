<template>
  <fieldset>
    <v-divider></v-divider>
    <div class="mt-5">
      <v-row>
        <v-col cols="8">
          <FcInputTextArray
            v-model="v.ccEmails.$model"
            :error-messages="errorMessagesCcEmails"
            label="Staff Subscribed"
            placeholder="Enter a @toronto.ca email address"
            :optional="!isUrgent"
            messages="Staff who will be notified when the data is ready"
            :key="componentKey"
            :success="v.urgent.$model && !v.ccEmails.$invalid" />
        </v-col>
      </v-row>
    </div>

    <v-checkbox
      v-model="v.urgent.$model"
      class="mt-1 urgent"
      :label="label"
      @click="scrollRequiredIntoView()"
    />
    <FcTooltip
      content-class="fc-tooltip-status-progress-bar"
      :max-width="400"
      right>
      <template v-slot:activator="{ on }">
        <FcButton
          class="eta-info-icon"
          type="icon"
          v-on="on">
          <v-icon id="information-icon" small>mdi-information-outline</v-icon>
        </FcButton>
      </template>
      <span>Standard turnaround is 2 - 3 months, but timelines may vary based on seasonality,
        request volume, or other factors</span>
    </FcTooltip>
    <template v-if="v.urgent.$model">
      <v-row>
        <v-col cols="8">
          <FcDatePicker
            v-model="v.dueDate.$model"
            class="mt-3"
            :error-messages="errorMessagesDueDate"
            hide-details="auto"
            label="Expected By (YYYY-MM-DD)"
            dense
            :max="maxDueDate"
            :min="minDueDate"
            outlined
            :success="!v.dueDate.$invalid">
          </FcDatePicker>
        </v-col>
      </v-row>
      <div class="mt-4 urgent-notes" ref="urgentNotes">
        <FcTextarea
          v-model="v.urgentReason.$model"
          class="mt-3"
          :rows="2"
          :error-messages="errorMessagesUrgentReason"
          label="Urgent Reason"
          :optional="!isUrgent"
          :success="v.urgent.$model && !v.urgentReason.$invalid"
          @blur="v.urgentReason.$touch()" />
      </div>
    </template>
  </fieldset>
</template>

<script>
import { mapState } from 'vuex';

import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcTextarea from '@/web/components/inputs/FcTextarea.vue';
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcStudyRequestUrgent',
  components: {
    FcDatePicker,
    FcInputTextArray,
    FcTextarea,
    FcTooltip,
    FcButton,
  },
  props: {
    isCreate: Boolean,
    v: Object,
    nRequests: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      // CACHED DUE DATES
      dueDate: null,
      dueDateUrgent: null,
      componentKey: 0,
    };
  },
  computed: {
    isBulkRequest() {
      return this.nRequests > 1;
    },
    label() {
      let subject = 'This request is';
      if (this.isBulkRequest) subject = 'These requests are';
      return `${subject} urgent`;
    },
    errorMessagesCcEmails() {
      const errors = [];
      if (!this.v.ccEmails.requiredIfUrgent) {
        let ccErrorText = 'Please provide at least one additional point of contact for ';
        if (this.isBulkRequest) {
          ccErrorText += 'these urgent requests';
        } else {
          ccErrorText += 'this urgent request';
        }
        errors.push(ccErrorText);
      }
      this.v.ccEmails.$model.forEach((_, i) => {
        if (!this.v.ccEmails.$each[i].$dirty) {
          return;
        }
        if (!this.v.ccEmails.$each[i].required) {
          errors.push('Please enter a value');
        }
        if (!this.v.ccEmails.$each[i].torontoInternal) {
          errors.push('Please enter a valid @toronto.ca email address');
        }
      });
      return errors;
    },
    errorMessagesDueDate() {
      const errors = [];
      if (!this.v.dueDate.required) {
        const byDateErrorText = 'Please indicate when the data is needed by';
        errors.push(byDateErrorText);
      }
      return errors;
    },
    errorMessagesUrgentReason() {
      const errors = [];
      if (!this.v.urgentReason.requiredIfUrgent) {
        let reasonErrorText = 'Please provide the Data Collection team with a clear and concise reason why ';
        if (this.isBulkRequest) {
          reasonErrorText += 'these requests are urgent';
        } else {
          reasonErrorText += 'this request is urgent';
        }
        errors.push(reasonErrorText);
      }
      return errors;
    },
    maxDueDate() {
      const { now } = this;
      const urgent = this.v.urgent.$model;
      if (urgent) {
        return now.plus({ months: 2 });
      }
      return null;
    },
    isUrgent() {
      return this.v.urgent.$model;
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
  methods: {
    scrollRequiredIntoView() {
      if (this.isUrgent) {
        setTimeout(() => {
          this.$refs.urgentNotes.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 50);
      }
    },
  },
  watch: {
    'v.urgent.$model': function watchUrgent(urgent, urgentPrev) {
      this.componentKey += 1;
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

<style>
  .urgent {
    display: inline-block;
  }

  .urgent .v-label {
    padding: 1px 0 0 0 !important;
  }

  .eta-info-icon {
    position: relative;
    right: 5px;
    bottom: 5px;
  }

  .urgent-notes textarea {
    margin: 14px 0 !important;
    line-height: 1.4rem;
  }
</style>
