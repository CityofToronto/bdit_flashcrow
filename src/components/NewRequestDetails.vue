<template>
  <fieldset class="new-request-details">
    <div class="details-body">
      <div class="details-column">
        <div class="form-group">
          <label>* Reason for request?
            <v-select
              v-model="reason"
              class="form-select reason-for-request"
              :options="optionsReason"
              placeholder="Select reason for request" />
          </label>
          <div class="validation-error" v-if="!v.reason.required">
            A reason for the request must be selected.
          </div>
        </div>
        <div class="form-group">
          <label>Service Request Number (if applicable)
            <input v-model="serviceRequestId" type="text" />
          </label>
        </div>
      </div>
      <div class="details-column">
        <strong>Priority</strong>
        <div class="details-radios">
          <label>
            Urgent
            <input v-model="priority" type="radio" name="priority" value="URGENT" />
          </label>
          <label>
            Standard
            <input v-model="priority" type="radio" name="priority" value="STANDARD" />
          </label>
        </div>
        <div v-if="priority === 'URGENT'" class="panel panel-warning">
          <i class="fa fa-exclamation-triangle"></i>
          <span>
            You've marked this request urgent, which will mean reshuffling the request queue.
          </span>
          <p>
            The Traffic Safety Unit will contact you to make adjustments to the schedule.
          </p>
        </div>
        <div v-else-if="priority === 'STANDARD'" class="panel panel-primary">
          <i class="fa fa-calendar-check"></i>
          <span>
            Standard times to request counts are 2-3 months.  Peak times are April-June and
            September-November.
          </span>
          <p>
            Estimated Delivery of Data: {{estimatedDeliveryDate | date}}
          </p>
        </div>
      </div>
      <div class="details-column">
        <div class="form-group">
          <label>Other staff you'd like to update:
            <input
              v-model="ccEmails"
              type="text"
              placeholder="e.g. tom.delaney@toronto.ca, amy.schumer@toronto.ca" />
          </label>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import Constants from '@/lib/Constants';

export default {
  name: 'NewRequestDetails',
  props: {
    v: Object,
  },
  data() {
    return {
      optionsReason: Constants.REASONS,
    };
  },
  computed: {
    ccEmails: {
      get() {
        return this.dataSelectionMeta.ccEmails;
      },
      set(ccEmails) {
        this.setDataSelectionMeta({
          key: 'ccEmails',
          value: ccEmails,
        });
      },
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
    priority: {
      get() {
        return this.dataSelectionMeta.priority;
      },
      set(priority) {
        this.setDataSelectionMeta({
          key: 'priority',
          value: priority,
        });
      },
    },
    reason: {
      get() {
        return this.dataSelectionMeta.reason;
      },
      set(reason) {
        console.log(reason);
        this.setDataSelectionMeta({
          key: 'reason',
          value: reason,
        });
      },
    },
    serviceRequestId: {
      get() {
        return this.dataSelectionMeta.serviceRequestId;
      },
      set(serviceRequestId) {
        this.setDataSelectionMeta({
          key: 'serviceRequestId',
          value: serviceRequestId,
        });
      },
    },
    ...mapGetters([
      'dataSelectionItemsMeta',
      'dataSelectionMeta',
    ]),
    ...mapState(['dataSelection']),
  },
  methods: {
    ...mapActions(['setDataSelectionMeta']),
  },
};
</script>

<style lang="postcss">
.new-request-details {
  border: none;
  margin-top: calc(var(--sp) * 4);
  & > .details-body {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    & > .details-column {
      flex: 0 0 33.3333%;
      padding: 0 calc(var(--sp) * 2);
      & > .details-radios {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        & > label {
          flex: 0 0 50%;
          margin: calc(var(--sp) * 2) 0;
        }
      }
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
