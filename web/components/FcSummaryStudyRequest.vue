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
        <TdsPanel
          v-if="priority === 'STANDARD'"
          class="mb-xl"
          icon="calendar-check"
          variant="info">
          <i class="fa fa-calendar-check"></i>
          <p>
            Standard times to request counts are 2-3 months.
            Estimated Delivery Date: {{studyRequestEstimatedDeliveryDate | date}}
          </p>
        </TdsPanel>
        <TdsPanel
          v-else-if="priority === 'URGENT'"
          class="mb-xl"
          variant="warning">
          <p>
            You've marked this request urgent, which will mean reshuffling the request queue.
            The Traffic Safety Unit will contact you to make adjustments to the schedule.
          </p>
        </TdsPanel>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import TdsPanel from '@/web/components/tds/TdsPanel.vue';

export default {
  name: 'FcSummaryStudyRequest',
  components: {
    TdsPanel,
  },
  computed: {
    ccEmails() {
      return this.studyRequest.ccEmails;
    },
    ccEmailsHuman() {
      /*
       * TODO: this is a workaround to handle previously persisted study requests, until such
       * time as we can get a proper ORM / validation layer in place here.
       */
      if (Array.isArray(this.ccEmails)) {
        return this.ccEmails;
      }
      return this.ccEmails
        .trim()
        .split(',')
        .map(ccEmail => ccEmail.trim())
        .filter(ccEmail => !!ccEmail);
    },
    dueDate() {
      return this.studyRequest.dueDate;
    },
    hasServiceRequestId() {
      return this.studyRequest.hasServiceRequestId;
    },
    priority() {
      return this.studyRequest.priority;
    },
    priorityHuman() {
      if (this.priority === 'URGENT') {
        return 'Urgent';
      }
      return 'Standard';
    },
    reasons() {
      return this.studyRequest.reasons;
    },
    reasonsHuman() {
      return this.studyRequest.reasons.map((reasonValue) => {
        const { label } = this.requestReasons.find(({ value }) => value === reasonValue);
        return label;
      });
    },
    serviceRequestId() {
      return this.studyRequest.serviceRequestId;
    },
    ...mapGetters(['studyRequestEstimatedDeliveryDate']),
    ...mapState(['requestReasons', 'studyRequest']),
  },
};
</script>
