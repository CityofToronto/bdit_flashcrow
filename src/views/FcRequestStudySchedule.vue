<template>
  <div class="fc-request-study-schedule flex-fill">
    <h2>Schedule Your Request</h2>
    <div class="form-group">
      <strong>Do you have a service request number?</strong>
      <TdsButtonGroup
        v-model="hasServiceRequestId"
        name="hasServiceRequestId"
        :options="[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]"
        type="radio" />
    </div>
    <div class="form-group">
      <label>
        <span>Enter service request number:</span>
        <input
          v-model="serviceRequestId"
          class="font-size-l"
          name="serviceRequestId"
          type="text" />
      </label>
      <button
        class="font-size-m">
        <i class="fa fa-check"></i>
        <span> OK</span>
      </button>
    </div>
    <div class="form-group">
      <strong>What is the priority of your request?</strong>
      <TdsButtonGroup
        v-model="priority"
        name="priority"
        :options="[
          { label: 'Standard', value: 'STANDARD' },
          { label: 'Urgent', value: 'URGENT' },
        ]"
        type="radio" />
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
      <button
        class="font-size-m">
        <i class="fa fa-check"></i>
        <span> OK</span>
      </button>
    </div>
    <div class="form-group">
      <strong>When do you need the data by?</strong>
      <div class="mb-s">
        <DatePicker
          v-model="dueDate"
          mode="single"
          name="dueDate"
          size="l"
          v-bind="attrsDueDate">
        </DatePicker>
      </div>
      <button
        class="font-size-m">
        <i class="fa fa-check"></i>
        <span> OK</span>
      </button>
    </div>
    <div class="form-group">
      <strong>What's the reason for your request?</strong>
      <div class="mb-s">
        <TdsChecklistDropdown
          v-model="reasons"
          class="font-size-l"
          name="reasons"
          :options="REASONS">
          <span>
            Reasons for Request
            <span class="tds-badge">{{reasons.length}}</span>
          </span>
        </TdsChecklistDropdown>
      </div>
      <button
        class="font-size-m">
        <i class="fa fa-check"></i>
        <span> OK</span>
      </button>
    </div>
    <div class="form-group">
      <label>
        <span>Any staff you'd like to keep informed on the request?</span>
        <input
          v-model="ccEmails"
          class="font-size-l"
          name="ccEmails"
          type="text" />
      </label>
      <button
        class="font-size-m">
        <i class="fa fa-check"></i>
        <span> OK</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import DatePicker from '@/components/DatePicker.vue';
import TdsButtonGroup from '@/components/tds/TdsButtonGroup.vue';
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import Constants from '@/lib/Constants';
import validations from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcRequestStudySchedule',
  components: {
    DatePicker,
    TdsButtonGroup,
    TdsChecklistDropdown,
  },
  data() {
    const { now } = this.$store.state;
    const dueDate = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      now.getDate() + 1,
    );
    return {
      hasServiceRequestId: null,
      serviceRequestId: null,
      priority: null,
      dueDate,
      reasons: [],
      REASONS: Constants.REASONS,
    };
  },
  computed: {
    attrsDueDate() {
      const { now } = this.$store.state;
      if (this.priority === 'URGENT') {
        return {
          disabledDates: { start: null, end: this.now },
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
    ...mapState(['studyRequest']),
  },
  validations,
};
</script>

<style lang="postcss">
.fc-request-study-schedule {

}
</style>
