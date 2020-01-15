<template>
  <div class="fc-details-study-request">
    <div class="mt-4">
      <span>Is there a service number for your request?</span>
      <v-text-field
        v-model="internalValue.serviceRequestId"
        :messages="messagesServiceRequestId">
      </v-text-field>
    </div>
    <div class="mt-4">
      <span>What is the priority of your request? *</span>
      <TdsRadioGroup
        v-model="internalValue.priority"
        :messages="messagesPriority"
        :options="[
          { label: 'Standard', value: 'STANDARD' },
          { label: 'Urgent', value: 'URGENT' },
        ]" />
    </div>
    <div
      v-if="internalValue.priority === 'URGENT'"
      class="form-group mt-xl">
      <span>When do you need the data by? *</span>
      <div class="inner-container">
        <DatePicker
          v-model="v.dueDate.$model"
          :invalid="v.dueDate.$error"
          class="mb-m"
          mode="single"
          name="dueDate"
          :pane-width="480"
          show-icon
          size="l"
          v-bind="attrsDueDate">
        </DatePicker>
      </div>
      <TdsPanel
        v-if="v.dueDate.$error"
        class="inner-container"
        variant="error">
        <p>
          Please select a due date for this request.
        </p>
      </TdsPanel>
    </div>
    <div class="mt-4">
      <span>What reasons are there for your request? *</span>
      <v-select
        v-model="v.reasons.$model"
        chips
        :error-messages="errorMessagesReasons"
        item-text="label"
        :items="requestReasons"
        multiple></v-select>
    </div>
    <div class="mt-4">
      <span>Any other staff you'd like to keep informed on the request?</span>
      <FcInputTextArray
        v-model="v.ccEmails.$model"
        :v="v.ccEmails" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import {
  REQUEST_STUDY_REQUIRES_REASONS,
} from '@/lib/i18n/Strings';
import DatePicker from '@/web/components/DatePicker.vue';
import FcInputTextArray from '@/web/components/FcInputTextArray.vue';
import TdsPanel from '@/web/components/tds/TdsPanel.vue';
import TdsRadioGroup from '@/web/components/tds/TdsRadioGroup.vue';

export default {
  name: 'FcDetailsStudyRequest',
  components: {
    DatePicker,
    FcInputTextArray,
    TdsRadioGroup,
    TdsPanel,
  },
  props: {
    v: Object,
    value: Object,
  },
  data() {
    return {
      /*
       * Cache the due date in each priority state, in case the user switches
       * back and forth between priorities.
       */
      dueDateCached: {
        STANDARD: null,
        URGENT: null,
      },
    };
  },
  computed: {
    attrsDueDate() {
      const minDate = this.minDueDate;
      return {
        disabledDates: { start: null, end: minDate },
        minDate,
      };
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
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    messagesPriority() {
      const { priority } = this.internalValue;
      const messages = [];
      if (priority === 'STANDARD') {
        messages.push(
          'Standard times to request counts are 2-3 months. Peak times are April-June and September-November.',
        );
      } else if (priority === 'URGENT') {
        messages.push(
          'This requires reshuffling other requests. The Traffic Safety Unit will contact you to discuss further.',
        );
      }
      return messages;
    },
    messagesServiceRequestId() {
      return [
        'If this is related to a TMMS request, enter the service request ID here.',
      ];
    },
    minDueDate() {
      const { now, internalValue: { priority } } = this;
      if (priority === 'URGENT') {
        return now;
      }
      return now.plus({ months: 2 });
    },
    ...mapState(['now', 'requestReasons']),
  },
};
</script>

<style lang="postcss">
.fc-details-study-request {
  --outer-width: 640px;
  --inner-width: 480px;

  width: var(--outer-width);
  margin: 0 auto var(--space-xl) auto;
  & > .form-group .inner-container {
    width: var(--inner-width);
    margin: 0 auto;
  }
}
</style>
