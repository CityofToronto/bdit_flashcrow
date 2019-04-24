<template>
  <fieldset class="new-request-details-summary">
    <div class="details-body">
      <div class="details-column">
        <div class="form-group">
          <strong>Reason for request?</strong>
          <p>{{reason.label}}</p>
        </div>
        <div v-if="serviceRequestId" class="form-group">
          <strong>Service Request Number</strong>
          <p>{{serviceRequestId}}</p>
        </div>
      </div>
      <div class="details-column">
        <div class="form-group">
          <strong>Priority</strong>
          <p>{{priority}}</p>
        </div>
        <div class="form-group">
          <strong>Reference # to track request</strong>
          <p>1234567890</p>
        </div>
      </div>
      <div class="details-column">
        <div class="form-group">
          <strong v-if="ccEmailsHuman.length === 0">
            No other staff to update
          </strong>
          <template v-else>
            <strong>Other staff you'd like to update:</strong>
            <ul>
              <li
                v-for="(ccEmail, i) in ccEmailsHuman"
                :key="i">{{ccEmail}}</li>
            </ul>
          </template>
        </div>
      </div>
    </div>
    <div v-if="priority === 'URGENT'" class="panel panel-warning">
      <h3>Urgent Request</h3>
      <p>
        You've marked this request urgent.  The Traffic Safety Unit will
        contact you to make adjustments to the schedule.
      </p>
    </div>
    <div v-else class="panel panel-primary">
      <h3>Estimated Delivery Date: {{estimatedDeliveryDate | date}}</h3>
    </div>
  </fieldset>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'NewRequestDetailsSummary',
  computed: {
    ccEmails() {
      return this.dataSelectionMeta.ccEmails;
    },
    ccEmailsHuman() {
      return this.ccEmails
        .trim()
        .split(',')
        .map(ccEmail => ccEmail.trim())
        .filter(ccEmail => !!ccEmail);
    },
    estimatedDeliveryDate() {
      if (this.priority === 'URGENT') {
        return null;
      }
      /*
       * For now, the estimated delivery date is the latest midpoint of the date ranges
       * selected in CountDetails.
       *
       * TODO: better delivery date estimates
       * TODO: DRY with NewRequestDetails.vue
       */
      let tMax = new Date().valueOf();
      this.dataSelectionItemsMeta.forEach(({ dateRange }) => {
        let { start, end } = dateRange;
        start = start.valueOf();
        end = end.valueOf();
        const t = Math.round(start + (end - start) / 2);
        if (t > tMax) {
          tMax = t;
        }
      });
      return new Date(tMax);
    },
    priority() {
      return this.dataSelectionMeta.priority;
    },
    reason() {
      return this.dataSelectionMeta.reason;
    },
    serviceRequestId() {
      return this.dataSelectionMeta.serviceRequestId;
    },
    ...mapGetters([
      'dataSelectionItemsMeta',
      'dataSelectionMeta',
    ]),
    ...mapState(['dataSelection']),
  },
};
</script>

<style lang="postcss">
.new-request-details-summary {
  border: none;
  margin-top: calc(var(--sp) * 4);
  & > .details-body {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    & > .details-column {
      flex: 0 0 33.3333%;
      padding: 0 calc(var(--sp) * 2);
    }
  }
  .reason-for-request {
    .dropdown-menu {
      bottom: 100%;
      top: auto;
    }
  }
}
</style>
