<template>
  <section>
    <v-row class="mt-1 mb-2" tag="dl">
      <v-col cols="6">
        <dt class="subtitle-1">Requester</dt>
        <dd class="mt-1 display-1">
          <span v-if="requestedBy !== null">
            {{requestedBy | username}}
          </span>
        </dd>
      </v-col>
      <v-col cols="6">
        <template v-if="!isCreate">
          <dt class="subtitle-1">Submitted</dt>
          <dd class="mt-1 display-1">
            {{studyRequest.createdAt | date}}
          </dd>
        </template>
      </v-col>
      <v-col cols="6">
        <dt class="subtitle-1">Reason</dt>
        <dd class="mt-1 display-1">
          {{studyRequest.reason.text}}
        </dd>
      </v-col>
      <v-col cols="6">
        <dt class="subtitle-1">Due Date</dt>
        <dd class="mt-1 display-1">
          {{studyRequest.dueDate | date}}
        </dd>
        <dd
          v-if="studyRequest.urgent"
          class="align-center d-flex">
          <v-icon color="warning" left>mdi-clipboard-alert</v-icon>
          <v-messages :value="['This request has been marked as urgent.']" />
        </dd>
        <dd v-else>
          <v-messages
            class="mt-1"
            :value="['Standard times to request counts are 2-3 months.']" />
        </dd>
      </v-col>
      <v-col cols="12">
        <dt class="subtitle-1">Additional Information</dt>
        <dd class="mt-1 display-1">
          <span v-if="studyRequest.urgentReason">
            {{studyRequest.urgentReason}}
          </span>
          <span v-else>None</span>
        </dd>
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
