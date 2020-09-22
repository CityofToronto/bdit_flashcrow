<template>
  <section>
    <v-row class="mt-1 mb-2">
      <v-col cols="6">
        <div class="subtitle-1">Requester</div>
        <div class="mt-1 display-1">
          <span v-if="requestedBy !== null">
            {{requestedBy | username}}
          </span>
        </div>
      </v-col>
      <v-col cols="6">
        <template v-if="!isCreate">
          <div class="subtitle-1">Submitted</div>
          <div class="mt-1 display-1">
            {{studyRequest.createdAt | date}}
          </div>
        </template>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Reason</div>
        <div class="mt-1 display-1">
          {{studyRequest.reason.text}}
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Due Date</div>
        <div class="mt-1 display-1">
          {{studyRequest.dueDate | date}}
        </div>
        <div
          v-if="studyRequest.urgent"
          class="align-center d-flex">
          <v-icon color="warning" left>mdi-clipboard-alert</v-icon>
          <v-messages :value="['This request has been marked as urgent.']"></v-messages>
        </div>
        <v-messages
          v-else
          class="mt-1"
          :value="['Standard times to request counts are 2-3 months.']"></v-messages>
      </v-col>
      <v-col cols="12">
        <div class="subtitle-1">Additional Information</div>
        <div class="mt-1 display-1">
          <span v-if="studyRequest.urgentReason">
            {{studyRequest.urgentReason}}
          </span>
          <span v-else>None</span>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FcSummaryStudyRequest',
  props: {
    isCreate: {
      type: Boolean,
      default: false,
    },
    studyRequest: Object,
    studyRequestUsers: {
      type: Map,
      default() { return new Map(); },
    },
  },
  computed: {
    requestedBy() {
      if (this.isCreate) {
        return this.auth.user;
      }
      const { studyRequest, studyRequestUsers } = this;
      if (!studyRequestUsers.has(studyRequest.userId)) {
        return null;
      }
      return studyRequestUsers.get(studyRequest.userId);
    },
    ...mapState(['auth']),
  },
};
</script>
