<template>
  <section class="fc-summary-study-request">
    <v-row class="mt-1 mb-6">
      <v-col cols="6">
        <div class="subtitle-1">Status</div>
        <div class="mt-1 display-1">
          <div class="align-center d-flex">
            <v-icon
              :color="studyRequest.status.color"
              left>mdi-circle-medium</v-icon>
            <span>
              {{studyRequest.status.text}}
            </span>
          </div>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Service Request Number</div>
        <div class="mt-1 display-1">
          <span v-if="studyRequest.serviceRequestId">
            {{studyRequest.serviceRequestId}}
          </span>
          <span v-else>None</span>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Submitted</div>
        <div class="mt-1 display-1">
          {{studyRequest.createdAt | date}}
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Due Date</div>
        <div class="mt-1 display-1">
          {{studyRequest.dueDate | date}}
        </div>
        <div
          v-if="studyRequest.urgent"
          class="align-center d-flex mt-1">
          <v-icon color="warning" left>mdi-clipboard-alert</v-icon>
          <v-messages
            :value="['This request has been marked as urgent.']"></v-messages>
        </div>
        <v-messages
          v-else
          class="mt-1"
          :value="['Standard times to request counts are 2-3 months.']"></v-messages>
      </v-col>
      <v-col
        v-if="studyRequest.urgent"
        cols="6">
        <div class="subtitle-1">Additional Information</div>
        <div class="mt-1 display-1">
          <span v-if="studyRequest.urgentReason">
            {{studyRequest.urgentReason}}
          </span>
          <span v-else>None</span>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Reasons</div>
        <div
          v-for="(reason, i) in studyRequest.reasons"
          :key="i"
          class="mt-1 display-1">
          {{reason.text}}
        </div>
      </v-col>
      <v-col cols="6">
        <div class="subtitle-1">Informed Staff</div>
        <div class="mt-1 display-1">
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
