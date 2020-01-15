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
      class="mt-4">
      <span>When do you need the data by? *</span>
      <div>
        <FcDatePicker
          v-model="v.dueDate.$model"
          class="mt-2"
          :min="minDueDate"
          mode="single">
        </FcDatePicker>
      </div>
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
import FcInputTextArray from '@/web/components/FcInputTextArray.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import TdsRadioGroup from '@/web/components/tds/TdsRadioGroup.vue';

export default {
  name: 'FcDetailsStudyRequest',
  components: {
    FcDatePicker,
    FcInputTextArray,
    TdsRadioGroup,
  },
  props: {
    v: Object,
    value: Object,
  },
  computed: {
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
