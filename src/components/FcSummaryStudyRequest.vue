<template>
  <section class="fc-summary-study-request">
    <div class="flex-container-row">
      <div class="flex-1 px-m">
        <p>Service Request Number:</p>
        <p class="font-size-l mb-xl">
          <strong v-if="hasServiceRequestId">{{serviceRequestId}}</strong>
          <span v-else class="text-muted">N/A</span>
        </p>
      </div>
      <div class="flex-1 px-m">
        <p>Due Date:</p>
        <p class="font-size-l mb-xl">
          <strong>{{dueDate | date}}</strong>
        </p>
      </div>
    </div>
    <div class="flex-container-row">
      <div class="flex-1 px-m">
        <p>
          <span v-if="reasons.length === 1">Reason for request:</span>
          <span v-else>Reasons for request:</span>
        </p>
        <div class="font-size-l mt-m mb-xl">
          <div
            v-for="(reason, i) in reasonsHuman"
            :key="i"
            class="mb-s">
            <strong>{{reason}}</strong>
          </div>
        </div>
        <p>Additional emails to notify:</p>
        <p
          v-if="ccEmailsHuman.length === 0"
          class="font-size-l mb-xl text-muted">
          None
        </p>
        <div v-else class="font-size-l mt-m mb-xl">
          <div
            v-for="(ccEmail, i) in ccEmailsHuman"
            :key="i"
            class="mb-s">
            <strong>{{ccEmail}}</strong>
          </div>
        </div>
      </div>
      <div class="flex-1 px-m">
        <p>Priority:</p>
        <p class="font-size-l">
          <strong>{{priorityHuman}}</strong>
        </p>
        <div
          v-if="priority === 'STANDARD'"
          class="tds-panel tds-panel-info mb-xl">
          <i class="fa fa-calendar-check"></i>
          <p>
            Standard times to request counts are 2-3 months.
            Estimated Delivery Date: {{studyRequestEstimatedDeliveryDate | date}}
          </p>
        </div>
        <div
          v-else-if="priority === 'URGENT'"
          class="tds-panel tds-panel-warning mb-xl">
          <i class="fa fa-exclamation-triangle"></i>
          <p>
            You've marked this request urgent, which will mean reshuffling the request queue.
            The Traffic Safety Unit will contact you to make adjustments to the schedule.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Constants from '@/lib/Constants';

export default {
  name: 'FcSummaryStudyRequest',
  computed: {
    ccEmails() {
      return this.studyRequest.meta.ccEmails;
    },
    ccEmailsHuman() {
      return this.ccEmails
        .trim()
        .split(',')
        .map(ccEmail => ccEmail.trim())
        .filter(ccEmail => !!ccEmail);
    },
    dueDate() {
      return this.studyRequest.meta.dueDate;
    },
    hasServiceRequestId() {
      return this.studyRequest.meta.hasServiceRequestId;
    },
    priority() {
      return this.studyRequest.meta.priority;
    },
    priorityHuman() {
      if (this.priority === 'URGENT') {
        return 'Urgent';
      }
      return 'Standard';
    },
    reasons() {
      return this.studyRequest.meta.reasons;
    },
    reasonsHuman() {
      return this.reasons.map((reasonValue) => {
        const { label } = Constants.REASONS
          .find(({ value }) => value === reasonValue);
        return label;
      });
    },
    serviceRequestId() {
      return this.studyRequest.meta.serviceRequestId;
    },
    ...mapGetters(['studyRequestEstimatedDeliveryDate']),
    ...mapState(['studyRequest']),
  },
};
</script>

<style lang="postcss">
.fc-summary-study-request {

}
</style>
