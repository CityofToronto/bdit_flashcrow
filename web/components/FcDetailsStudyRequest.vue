<template>
  <section>
    <div class="mt-4">
      <h3 class="headline">311 Information</h3>
      <v-row>
        <v-col cols="8">
          <v-text-field
            v-model="internalValue.serviceRequestId"
            :messages="[OPTIONAL.text]"
            outlined
            placeholder="Service Number">
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

    <div class="mt-4">
      <h3 class="headline">Escalate Priority</h3>
      <v-checkbox
        v-model="internalValue.urgent"
        class="mt-1"
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
          placeholder="Additional Information"
          rows="4"
          @blur="v.urgentReason.$touch()"></v-textarea>
        <v-row>
          <v-col cols="8">
            <FcDatePicker
              v-model="v.dueDate.$model"
              class="mt-3"
              :error-messages="errorMessagesDueDate"
              :messages="[REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE.text]"
              :min="minDueDate"
              placeholder="Due Date">
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
            :messages="[OPTIONAL.text]"
            placeholder="Staff Email" />
        </v-col>
      </v-row>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import {
  StudyRequestReason,
} from '@/lib/Constants';
import {
  OPTIONAL,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_REASONS,
} from '@/lib/i18n/Strings';
import FcCheckboxGroupChips from '@/web/components/inputs/FcCheckboxGroupChips.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudyRequest',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcCheckboxGroupChips,
    FcDatePicker,
    FcInputTextArray,
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
    itemsReasons() {
      const itemsReasons = StudyRequestReason.enumValues.map((value) => {
        const { text } = value;
        return { text, value };
      });
      return ArrayUtils.sortBy(itemsReasons, ({ text }) => text);
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
};
</script>
