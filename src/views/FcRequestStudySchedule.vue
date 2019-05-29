<template>
  <div class="fc-request-study-schedule flex-fill flex-container-column">
    <header>
      <h2>Schedule Your Request</h2>
    </header>
    <section class="flex-fill flex-container-row">
      <div class="flex-cross-scroll">
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
        <fieldset>
          <legend>
            <span class="number-icon">1</span>
            Turning Movement Count
          </legend>
          <div class="flex-container-row">
            <div class="form-group flex-1">
              <strong>When do you want your study to be conducted?</strong>
              <DatePicker
                v-model="dateRange0"
                mode="range"
                name="dateRange0"
                size="l"
                v-bind="attrsDueDate">
              </DatePicker>
            </div>
            <div class="form-group flex-1">
              <strong>What days of the week should the study fall on?</strong>
              <TdsButtonGroup
                v-model="daysOfWeek0"
                name="daysOfWeek0"
                :options="[
                  { label: 'Su', value: 0 },
                  { label: 'M', value: 1 },
                  { label: 'Tu', value: 2 },
                  { label: 'W', value: 3 },
                  { label: 'Th', value: 4 },
                  { label: 'F', value: 5 },
                  { label: 'Sa', value: 6 },
                ]"
                type="checkbox" />
            </div>
          </div>
          <div class="flex-container-row">
            <div class="form-group flex-1">
              <strong>What type of hours should we use?</strong>
              <TdsRadioGroup
                v-model="hours0"
                name="hours0"
                :options="[
                  { label: 'School', value: 'SCHOOL' },
                  { label: 'Routine', value: 'ROUTINE' },
                  { label: 'Other', value: 'OTHER' },
                ]" />
            </div>
            <div class="form-group flex-1">
              <strong>&nbsp;</strong>
              <div
                v-if="hours0 === 'SCHOOL'"
                class="tds-panel tds-panel-info">
                <i class="fa fa-clock"></i>
                <p>
                  School hours:
                </p>
                <p>
                  <small>
                  07:30 &ndash; 09:30<br />
                  10:00 &ndash; 11:00<br />
                  12:00 &ndash; 13:30<br />
                  14:15 &ndash; 15:45<br />
                  16:00 &ndash; 18:00
                  </small>
                </p>
              </div>
              <div
                v-else-if="hours0 === 'ROUTINE'"
                class="tds-panel tds-panel-info">
                <i class="fa fa-clock"></i>
                <p>
                  Routine hours:
                </p>
                <p>
                  <small>
                  07:30 &ndash; 09:30<br />
                  10:00 &ndash; 12:00<br />
                  13:00 &ndash; 15:00<br />
                  16:00 &ndash; 18:00
                  </small>
                </p>
              </div>
              <div
                v-else-if="hours0 === 'OTHER'"
                class="tds-panel tds-panel-warning">
                <i class="fa fa-clock"></i>
                <p>
                  Please specify your desired schedule in the notes below.
                </p>
              </div>
            </div>
          </div>
          <div class="flex-container-row">
            <div class="form-group flex-fill">
              <strong>Any additional notes you'd like to share?</strong>
              <textarea
                v-model="notes0"
                name="notes0"
                rows="5"></textarea>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span class="number-icon">2</span>
            Speed / Volume ATR
          </legend>
        </fieldset>
      </div>
    </section>
  </div>
</template>

<script>
import {
  numeric,
  required,
  requiredIf,
} from 'vuelidate/lib/validators';
import { mapState } from 'vuex';

import DatePicker from '@/components/DatePicker.vue';
import TdsButtonGroup from '@/components/tds/TdsButtonGroup.vue';
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import TdsRadioGroup from '@/components/tds/TdsRadioGroup.vue';
import Constants from '@/lib/Constants';
// import validations from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcRequestStudySchedule',
  components: {
    DatePicker,
    TdsButtonGroup,
    TdsChecklistDropdown,
    TdsRadioGroup,
  },
  data() {
    const { now } = this.$store.state;
    const dueDate = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      now.getDate() + 1,
    );
    return {
      // top-level meta
      hasServiceRequestId: null,
      serviceRequestId: null,
      priority: null,
      dueDate,
      reasons: [],
      REASONS: Constants.REASONS,
      // manual studies
      dateRange0: null,
      daysOfWeek0: [2, 3, 4],
      hours0: 'ROUTINE',
      notes0: '',
      // automatic counts
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
  validations: {
    hasServiceRequestId: {
      required,
    },
    serviceRequestId: {
      numeric,
      requiredIfHasServiceRequestId: requiredIf('hasServiceRequestId'),
    },
    priority: {
      required,
      mustBeStandardOrUrgent: value => value === 'STANDARD' || value === 'URGENT',
    },
    dueDate: {
      required,
    },
    reasons: {
      required,
    },
  },
};
</script>

<style lang="postcss">
.fc-request-study-schedule {
  fieldset {
    & > legend {
      padding-left: 0;
    }
    & > .flex-container-row {
      padding: var(--space-m) var(--space-l);
      & > .form-group {
        padding: 0 var(--space-l);
      }
    }
  }
  .number-icon {
    background-color: var(--white);
    border: var(--border-default);
    border-radius: 50%;
    color: var(--ink);
    display: inline-block;
    font-size: var(--font-size-l);
    font-weight: var(--font-weight-bold);
    height: calc(var(--font-size-l) * 1.25);
    line-height: var(--font-size-l);
    margin-right: var(--space-xs);
    padding: var(--space-xs);
    text-align: center;
    width: calc(var(--font-size-l) * 1.25);
  }
}
</style>
