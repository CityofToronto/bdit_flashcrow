<template>
  <section>
    <div class="mt-4">
      <h3>311 Information</h3>
      <v-text-field
        v-model="internalValue.serviceRequestId"
        class="mt-2"
        :messages="[OPTIONAL.text]"
        outlined
        placeholder="Service Number">
      </v-text-field>
    </div>

    <div class="mt-4">
      <h3>Reasons</h3>
      <FcCheckboxGroupChips
        v-model="v.reasons.$model"
        item-text="label"
        :items="requestReasons"></FcCheckboxGroupChips>
      <v-messages
        class="mt-1"
        color="error"
        :value="errorMessagesReasons"></v-messages>
    </div>

    <div class="mt-4">
      <h3>Escalate Priority</h3>
      <v-checkbox
        v-model="internalValue.urgent"
        label="Urgent"
        :messages="[OPTIONAL.text]" />
      <template v-if="internalValue.urgent">
        <v-textarea
          v-model="v.urgentReason.$model"
          class="mt-3"
          :error-messages="errorMessagesUrgentReason"
          :messages="[REQUEST_STUDY_PROVIDE_URGENT_REASON.text]"
          no-resize
          outlined
          rows="4"
          @blur="v.urgentReason.$touch()"></v-textarea>
        <FcDatePicker
          v-model="v.dueDate.$model"
          class="mt-3"
          :min="minDueDate"
          mode="single">
        </FcDatePicker>
      </template>
    </div>

    <div class="mt-4">
      <h3>Inform Other Staff</h3>
      <FcInputTextArray
        v-model="v.ccEmails.$model" />
      <v-messages
        class="mt-1"
        color="error"
        :value="errorMessagesCcEmails"></v-messages>
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
import FcCheckboxGroupChips from '@/web/components/inputs/FcCheckboxGroupChips.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';

export default {
  name: 'FcDetailsStudyRequest',
  components: {
    FcCheckboxGroupChips,
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
