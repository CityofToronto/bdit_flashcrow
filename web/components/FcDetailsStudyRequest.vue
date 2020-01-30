<template>
  <section>
    <div class="mt-4">
      <h3>311 Information</h3>
      <v-text-field
        v-model="internalValue.serviceRequestId"
        :messages="[OPTIONAL.text]"
        outlined
        placeholder="Service Number">
      </v-text-field>
    </div>
    <div class="mt-4">
      <h3>Reasons</h3>
      <v-select
        v-model="v.reasons.$model"
        chips
        :error-messages="errorMessagesReasons"
        item-text="label"
        :items="requestReasons"
        multiple></v-select>
    </div>
    <div class="mt-4">
      <h3>Escalate Priority</h3>
      <v-checkbox
        v-model="internalValue.urgent"
        label="Urgent"
        :messages="[OPTIONAL.text]" />
      <div
        v-if="internalValue.urgent"
        class="mt-3">
        <v-textarea
          v-model="v.urgentReason.$model"
          :error-messages="errorMessagesUrgentReason"
          :messages="[REQUEST_STUDY_PROVIDE_URGENT_REASON.text]"
          no-resize
          outlined
          rows="4"
          @blur="v.urgentReason.$touch()"></v-textarea>
      </div>
      <FcDatePicker
        v-model="v.dueDate.$model"
        class="mt-4"
        :min="minDueDate"
        mode="single">
      </FcDatePicker>
    </div>
    <div class="mt-4">
      <h3>Inform Other Staff</h3>
      <FcInputTextArray
        v-model="v.ccEmails.$model"
        :v="v.ccEmails" />
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import {
  OPTIONAL,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_REASONS,
} from '@/lib/i18n/Strings';
import FcInputTextArray from '@/web/components/FcInputTextArray.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';

export default {
  name: 'FcDetailsStudyRequest',
  components: {
    FcDatePicker,
    FcInputTextArray,
  },
  props: {
    v: Object,
    value: Object,
  },
  data() {
    return {
      OPTIONAL,
      REQUEST_STUDY_PROVIDE_URGENT_REASON,
    };
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
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
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
