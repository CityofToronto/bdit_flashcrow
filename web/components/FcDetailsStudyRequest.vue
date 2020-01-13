<template>
  <div class="fc-details-study-request">
    <div class="form-group mt-xl">
      <label>
        <span>Is there a service number for your request?</span>
        <div class="inner-container">
          <input
            v-model="serviceRequestId"
            class="font-size-l full-width mb-m"
            name="serviceRequestId"
            type="text" />
        </div>
      </label>
    </div>
    <div class="form-group mt-xl">
      <strong>What is the priority of your request? *</strong>
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
      <TdsPanel
        v-if="priority === 'STANDARD'"
        class="inner-container"
        icon="calendar-check"
        variant="info">
        <p>
          Standard times to request counts are 2-3 months.
          Peak times are April-June and September-November.
        </p>
      </TdsPanel>
      <TdsPanel
        v-else-if="priority === 'URGENT'"
        class="inner-container"
        variant="warning">
        <p>
          You've marked this request urgent, which will mean reshuffling the request queue.
          The Traffic Safety Unit will contact you to make adjustments to the schedule.
        </p>
      </TdsPanel>
    </div>
    <div
      v-if="priority === 'URGENT'"
      class="form-group mt-xl">
      <strong>When do you need the data by? *</strong>
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
      <TdsPanel
        v-if="v.dueDate.$error"
        class="inner-container"
        variant="error">
        <p>
          Please select a due date for this request.
        </p>
      </TdsPanel>
    </div>
    <div class="form-group mt-xl">
      <strong>What reasons are there for your request? *</strong>
      <div class="inner-container mb-s">
        <TdsChecklistDropdown
          v-model="v.reasons.$model"
          class="font-size-l full-width mb-m"
          :class="{
            'tds-button-success': reasons.length > 0,
          }"
          :invalid="v.reasons.$error"
          name="reasons"
          :options="requestReasons">
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
      <TdsPanel
        v-if="v.reasons.$error"
        class="inner-container"
        variant="error">
        <p>
          Please select one or more reasons for this request.
        </p>
      </TdsPanel>
    </div>
    <div class="form-group mt-xl">
      <label>
        <span>Any other staff you'd like to keep informed on the request?</span>
        <div class="inner-container">
          <FcInputTextArray
            v-model="v.ccEmails.$model"
            name="ccEmails" />
        </div>
      </label>
      <TdsPanel
        v-if="v.ccEmails.$error"
        class="inner-container"
        variant="error">
        <p>
          Please enter valid <strong>@toronto.ca</strong> email addresses.
        </p>
      </TdsPanel>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import DatePicker from '@/web/components/DatePicker.vue';
import FcInputTextArray from '@/web/components/FcInputTextArray.vue';
import TdsButtonGroup from '@/web/components/tds/TdsButtonGroup.vue';
import TdsChecklistDropdown from '@/web/components/tds/TdsChecklistDropdown.vue';
import TdsPanel from '@/web/components/tds/TdsPanel.vue';

export default {
  name: 'FcDetailsStudyRequest',
  components: {
    DatePicker,
    FcInputTextArray,
    TdsButtonGroup,
    TdsChecklistDropdown,
    TdsPanel,
  },
  props: {
    v: Object,
    value: Object,
  },
  data() {
    return {
      /*
       * Cache the due date in each priority state, in case the user switches
       * back and forth between priorities.
       */
      dueDateCached: {
        STANDARD: null,
        URGENT: null,
      },
    };
  },
  computed: {
    attrsDueDate() {
      const minDate = this.minDueDate;
      return {
        disabledDates: { start: null, end: minDate },
        minDate,
      };
    },
    ccEmails: {
      get() {
        return this.studyRequest.ccEmails;
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
        return this.studyRequest.dueDate;
      },
      set(dueDate) {
        this.setStudyRequestMeta({
          key: 'dueDate',
          value: dueDate,
        });
      },
    },
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    minDueDate() {
      const { now, studyRequest } = this;
      if (studyRequest.priority === 'URGENT') {
        return now;
      }
      return now.plus({ months: 2 });
    },
    priority: {
      get() {
        return this.studyRequest.priority;
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
        return this.studyRequest.reasons;
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
        return this.studyRequest.serviceRequestId;
      },
      set(serviceRequestId) {
        this.setStudyRequestMeta({
          key: 'serviceRequestId',
          value: serviceRequestId,
        });
      },
    },
    ...mapState(['now', 'requestReasons']),
  },
  watch: {
    dueDate: {
      handler() {
        Vue.set(this.dueDateCached, this.priority, this.dueDate);
      },
      immediate: true,
    },
    priority() {
      this.dueDate = this.dueDateCached[this.priority];
    },
  },
};
</script>

<style lang="postcss">
.fc-details-study-request {
  --outer-width: 640px;
  --inner-width: 480px;

  width: var(--outer-width);
  margin: 0 auto var(--space-xl) auto;
  & > .form-group .inner-container {
    width: var(--inner-width);
    margin: 0 auto;
  }
}
</style>
