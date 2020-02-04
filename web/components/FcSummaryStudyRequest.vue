<template>
  <section class="fc-summary-study-request">
    <v-row class="mt-1 mb-6">
      <v-col cols="6">
        <div>Status</div>
        <div class="mt-1 title">
          {{studyRequest.status.text}}
        </div>
      </v-col>
      <v-col cols="6">
        <div>Service Request Number</div>
        <div class="mt-1 title">
          <span v-if="studyRequest.serviceRequestId">
            {{studyRequest.serviceRequestId}}
          </span>
          <span v-else>None</span>
        </div>
        <div class="mt-1 title">
          {{studyRequest.createdAt | date}}
        </div>
      </v-col>
      <v-col cols="6">
        <div>Submitted</div>
        <div class="mt-1 title">
          {{studyRequest.createdAt | date}}
        </div>
      </v-col>
      <v-col cols="6">
        <div>Due Date</div>
        <div class="mt-1 title">
          {{studyRequest.dueDate | date}}
        </div>
        <div
          v-if="studyRequest.urgent"
          class="align-center d-flex">
          <v-icon color="warning">mdi-clipboard-alert</v-icon>
          <v-messages
            :value="['This request has been marked as urgent.']"></v-messages>
        </div>
        <v-messages
          v-else
          :value="['Standard times to request counts are 2-3 months.']"></v-messages>
      </v-col>
      <v-col
        v-if="studyRequest.urgent"
        cols="6">
        <div>Additional Information</div>
        <div class="mt-1 title">
          <span v-if="studyRequest.urgentReason">
            {{studyRequest.urgentReason}}
          </span>
          <span v-else>None</span>
        </div>
      </v-col>
      <v-col cols="6">
        <div>Reasons</div>
        <div class="mt-1 title">
          <div
            v-for="(reason, i) in studyRequest.reasons"
            :key="i">
            {{reason.text}}
          </div>
        </div>
      </v-col>
      <v-col cols="6">
        <div>Informed Staff</div>
        <div class="mt-1 title">
          <span v-if="studyRequest.ccEmails.length === 0">None</span>
          <div
            v-for="(ccEmail, i) in studyRequest.ccEmails"
            :key="i">
            {{ccEmail}}
          </div>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<script>
export default {
  name: 'FcSummaryStudyRequest',
  props: {
    studyRequest: Object,
  },
};
</script>
