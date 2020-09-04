<template>
  <section class="pa-5">
    <div class="mt-1">
      <h3 class="headline">Create Request Name</h3>
      <v-row>
        <v-col cols="8">
          <v-text-field
            v-model="internalValue.name"
            label="Set Title for Bulk Request"
            :messages="['Required']"
            outlined>
          </v-text-field>
        </v-col>
      </v-row>
    </div>

    <div class="mt-1">
      <h3 class="headline">Reason for Request</h3>
      <v-row>
        <v-col cols="8">
          <v-select
            v-model="reason"
            hide-details
            :items="itemsReasons"
            label="Reason"
            outlined />
        </v-col>
      </v-row>
    </div>

    <div class="mt-4">
      <h3 class="headline">Escalate Priority</h3>
      <v-checkbox
        v-model="urgent"
        class="mt-1"
        label="Urgent"
        :messages="[OPTIONAL.text]" />
      <template v-if="urgent">
        <v-row>
          <v-col cols="8">
            <FcDatePicker
              v-model="dueDate"
              class="mt-3"
              label="Due Date"
              :max="maxDueDate"
              :min="minDueDate">
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
            v-model="ccEmails"
            label="Staff Email" />
        </v-col>
      </v-row>
    </div>

    <div>
      <v-textarea
        v-model="urgentReason"
        label="Additional Information"
        :messages="messagesUrgentReason"
        no-resize
        outlined
        rows="4"></v-textarea>
    </div>
  </section>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import { StudyRequestReason } from '@/lib/Constants';
import { OPTIONAL } from '@/lib/i18n/Strings';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkDetails',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcDatePicker,
    FcInputTextArray,
  },
  data() {
    return {
      OPTIONAL,
      ccEmails: [],
      dueDate: null,
      reason: null,
      urgent: false,
      urgentReason: null,
    };
  },
  computed: {
    itemsReasons() {
      const itemsReasons = StudyRequestReason.enumValues.map((value) => {
        const { name, text } = value;
        return { text, value: name };
      });
      return ArrayUtils.sortBy(itemsReasons, ({ text }) => text);
    },
    messagesUrgentReason() {
      if (this.urgent) {
        return [];
      }
      return [OPTIONAL.text];
    },
  },
  watch: {
    reason() {
      const reasons = this.reason === null ? [] : [this.reason];
      const { studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i] = reasons;
      }
    },
  },
};
</script>
