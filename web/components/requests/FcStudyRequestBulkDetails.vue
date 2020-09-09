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
          <FcSelectEnum
            v-model="internalValue.reason"
            hide-details
            label="Reason"
            :of-type="StudyRequestReason"
            outlined />
        </v-col>
      </v-row>
    </div>

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
              v-model="internalValue.dueDate"
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
            v-model="internalValue.ccEmails"
            label="Staff Email" />
        </v-col>
      </v-row>
    </div>

    <div>
      <v-textarea
        v-model="internalValue.urgentReason"
        label="Additional Information"
        :messages="messagesUrgentReason"
        no-resize
        outlined
        rows="4"></v-textarea>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import { StudyRequestReason } from '@/lib/Constants';
import { OPTIONAL } from '@/lib/i18n/Strings';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkDetails',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcDatePicker,
    FcInputTextArray,
    FcSelectEnum,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      OPTIONAL,
      StudyRequestReason,
    };
  },
  computed: {
    maxDueDate() {
      const { now, urgent } = this;
      if (urgent) {
        return now.plus({ months: 2 });
      }
      return null;
    },
    messagesUrgentReason() {
      if (this.urgent) {
        return [];
      }
      return [OPTIONAL.text];
    },
    minDueDate() {
      const { now, urgent } = this;
      if (urgent) {
        return now.plus({ weeks: 1 });
      }
      return now.plus({ months: 2 });
    },
    ...mapState(['now']),
  },
  watch: {
    'internalValue.ccEmails': function watchCcEmails() {
      const { ccEmails, studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].ccEmails = ccEmails;
      }
    },
    'internalValue.dueDate': function watchDueDate() {
      const { dueDate, studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].dueDate = dueDate;
      }
    },
    'internalValue.reason': function watchReason() {
      const { reason, studyRequests } = this.internalValue;
      const reasons = reason === null ? [] : [reason];
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].reasons = reasons;
      }
    },
    'internalValue.urgent': function watchUrgent() {
      const { urgent, studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].urgent = urgent;
      }
    },
    'internalValue.urgentReason': function watchUrgentReason() {
      const { urgentReason, studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].urgentReason = urgentReason;
      }
    },
  },
};
</script>
