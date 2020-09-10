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
          <FcStudyRequestReason :v="v" />
        </v-col>
      </v-row>
    </div>

    <FcStudyRequestUrgent
      class="mt-4"
      :is-create="true"
      :v="v" />
  </section>
</template>

<script>
import { StudyRequestReason } from '@/lib/Constants';
import { OPTIONAL } from '@/lib/i18n/Strings';
import FcStudyRequestReason from '@/web/components/requests/fields/FcStudyRequestReason.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkDetails',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcStudyRequestReason,
    FcStudyRequestUrgent,
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
    'internalValue.estimatedDeliveryDate': function watchDueDate() {
      const { estimatedDeliveryDate, studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].estimatedDeliveryDate = estimatedDeliveryDate;
      }
    },
    'internalValue.reason': function watchReason() {
      const { reason, studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].reason = reason;
      }
    },
    'internalValue.reasonOther': function watchReason() {
      const { reasonOther, studyRequests } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].reasonOther = reasonOther;
      }
    },
    'internalValue.urgent': function watchUrgent() {
      const { studyRequests, urgent } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].urgent = urgent;
      }
    },
    'internalValue.urgentReason': function watchUrgentReason() {
      const { studyRequests, urgentReason } = this.internalValue;
      const n = studyRequests.length;
      for (let i = 0; i < n; i++) {
        studyRequests[i].urgentReason = urgentReason;
      }
    },
  },
};
</script>
