<template>
  <div class="fc-details-study-request">
    <div class="form-group mt-xl">
      <strong>Do you have a service request number?</strong>
      <div class="inner-container">
        <TdsButtonGroup
          v-model="v.hasServiceRequestId.$model"
          class="font-size-l"
          :invalid="v.hasServiceRequestId.$error"
          name="hasServiceRequestId"
          :options="[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]"
          type="radio" />
      </div>
    </div>
    <div class="form-group mt-xl">
      <label>
        <span>Enter service request number:</span>
        <div class="inner-container">
          <input
            v-model="v.serviceRequestId.$model"
            class="font-size-l full-width mb-m"
            :class="{
              invalid: v.serviceRequestId.$error,
            }"
            :disabled="!hasServiceRequestId"
            name="serviceRequestId"
            type="text" />
        </div>
      </label>
      <div
        v-if="v.serviceRequestId.$error"
        class="inner-container tds-panel tds-panel-error">
        <i class="fa fa-times-circle"></i>
        <p>
          Please enter your service request number.
        </p>
      </div>
    </div>
    <div class="form-group mt-xl">
      <strong>What is the priority of your request?</strong>
      <div class="inner-container">
        <TdsButtonGroup
          v-model="priority"
          class="font-size-l"
          name="priority"
          :options="[
            { label: 'Standard', value: 'STANDARD' },
            { label: 'Urgent', value: 'URGENT' },
          ]"
          type="radio" />
      </div>
      <div
        v-if="priority === 'STANDARD'"
        class="tds-panel tds-panel-info">
        <i class="fa fa-calendar-check"></i>
        <p>
          Standard times to request counts are 2-3 months.
          Peak times are April-June and September-November.
        </p>
      </div>
      <div
        v-else-if="priority === 'URGENT'"
        class="tds-panel tds-panel-warning">
        <i class="fa fa-exclamation-triangle"></i>
        <p>
          You've marked this request urgent, which will mean reshuffling the request queue.
          The Traffic Safety Unit will contact you to make adjustments to the schedule.
        </p>
      </div>
    </div>
    <div class="form-group mt-xl">
      <strong>When do you need the data by?</strong>
      <div class="inner-container">
        <DatePicker
          v-model="v.dueDate.$model"
          :invalid="v.dueDate.$error"
          class="mb-m"
          mode="single"
          name="dueDate"
          :pane-width="480"
          show-icon
          size="l"
          v-bind="attrsDueDate">
        </DatePicker>
      </div>
      <div
        v-if="v.dueDate.$error"
        class="inner-container tds-panel tds-panel-error">
        <i class="fa fa-times-circle"></i>
        <p>
          Please select a due date for this request.
        </p>
      </div>
    </div>
    <div class="form-group mt-xl">
      <strong>What's the reason for your request?</strong>
      <div class="inner-container mb-s">
        <TdsChecklistDropdown
          v-model="v.reasons.$model"
          class="font-size-l full-width mb-m text-left"
          :class="{
            'tds-button-success': reasons.length > 0,
          }"
          :invalid="v.reasons.$error"
          name="reasons"
          :options="REASONS">
          <span>
            Reasons for Request
            <span
              class="tds-badge"
              :class="{
                'tds-badge-success': reasons.length > 0,
              }">{{reasons.length}}</span>
          </span>
        </TdsChecklistDropdown>
      </div>
      <div
        v-if="v.reasons.$error"
        class="inner-container tds-panel tds-panel-error">
        <i class="fa fa-times-circle"></i>
        <p>
          Please select one or more reasons for this request.
        </p>
      </div>
    </div>
    <div class="form-group mt-xl">
      <label>
        <span>Any staff you'd like to keep informed on the request?</span>
        <div class="inner-container">
          <input
            v-model.lazy="v.ccEmails.$model"
            class="font-size-l full-width mb-m"
            :class="{
              invalid: v.ccEmails.$error,
            }"
            name="ccEmails"
            type="text" />
        </div>
      </label>
      <div
        v-if="v.ccEmails.$error"
        class="inner-container tds-panel tds-panel-error">
        <i class="fa fa-times-circle"></i>
        <p>
          Please enter a comma-separated list of valid
          <strong>@toronto.ca</strong> email addresses.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import DatePicker from '@/components/DatePicker.vue';
import TdsButtonGroup from '@/components/tds/TdsButtonGroup.vue';
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FcDetailsStudyRequest',
  components: {
    DatePicker,
    TdsButtonGroup,
    TdsChecklistDropdown,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      REASONS: Constants.REASONS,
    };
  },
  computed: {
    attrsDueDate() {
      const { now } = this.$store.state;
      if (this.priority === 'URGENT') {
        return {
          disabledDates: { start: null, end: now },
          minDate: now,
        };
      }
      const twoMonthsOut = new Date(
        now.getFullYear(),
        now.getMonth() + 2,
        now.getDate(),
      );
      return {
        disabledDates: { start: null, end: twoMonthsOut },
        minDate: twoMonthsOut,
      };
    },
    ccEmails: {
      get() {
        return this.studyRequest.meta.ccEmails;
      },
      set(ccEmails) {
        this.setStudyRequestMeta({
          key: 'ccEmails',
          value: ccEmails,
        });
      },
    },
    dueDate: {
      get() {
        return this.studyRequest.meta.dueDate;
      },
      set(dueDate) {
        this.setStudyRequestMeta({
          key: 'dueDate',
          value: dueDate,
        });
      },
    },
    hasServiceRequestId: {
      get() {
        return this.studyRequest.meta.hasServiceRequestId;
      },
      set(hasServiceRequestId) {
        this.setStudyRequestMeta({
          key: 'hasServiceRequestId',
          value: hasServiceRequestId,
        });
        if (!hasServiceRequestId) {
          this.serviceRequestId = null;
        }
      },
    },
    priority: {
      get() {
        return this.studyRequest.meta.priority;
      },
      set(priority) {
        this.setStudyRequestMeta({
          key: 'priority',
          value: priority,
        });
      },
    },
    reasons: {
      get() {
        return this.studyRequest.meta.reasons;
      },
      set(reasons) {
        this.setStudyRequestMeta({
          key: 'reasons',
          value: reasons,
        });
      },
    },
    serviceRequestId: {
      get() {
        return this.studyRequest.meta.serviceRequestId;
      },
      set(serviceRequestId) {
        this.setStudyRequestMeta({
          key: 'serviceRequestId',
          value: serviceRequestId,
        });
      },
    },
    ...mapState(['studyRequest']),
  },
  methods: {
    ...mapMutations(['setStudyRequestMeta']),
  },
};
</script>

<style lang="postcss">
.fc-details-study-request {
  --outer-width: 640px;
  --inner-width: 480px;

  width: var(--outer-width);
  margin: 0 auto var(--space-xl) auto;
  & > .form-group > .inner-container {
    width: var(--inner-width);
    margin: 0 auto;
  }
}
</style>
