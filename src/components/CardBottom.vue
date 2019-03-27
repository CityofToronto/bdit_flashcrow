<template>
  <div
    class="card-bottom"
    :class="{'card-bottom-full': requestStep > 1}">
    <b-modal
      v-model="showModalView"
      size="xl"
      :title="titleModalView"
      ok-only>
      <b-container fluid>
        <b-row v-if="countViewed !== null">
          <b-col cols="4">
            <h3>Available Counts ({{ countViewed.length }})</h3>
            <b-list-group>
              <b-list-group-item
                v-for="(count, index) in countViewed"
                :key="index"
                :active="index === countViewedIndexActive"
                @click="countViewedIndexActive = index">
                {{ count.date | date }}
              </b-list-group-item>
            </b-list-group>
          </b-col>
          <b-col cols="8">
            <b-button-group class="float-right mb-3">
              <b-button
                variant="outline-secondary"
                @click="countViewedPrint">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24.75 24.75"><path d="M22,0H2.75V6.88H0v11H2.75v6.87H22V17.88h2.75v-11H22ZM4.12,1.38h16.5v5.5H4.12Zm0,22V13.75h16.5v9.63Z"/><rect x="18.63" y="9.88" width="1.25" height="1.25"/><rect class="cls-1" x="6.13" y="14.88" width="12.5" height="1.25"/><rect class="cls-1" x="6.13" y="17.38" width="12.5" height="1.25"/></svg>
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="countViewedDownload">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24.17 25.39"><polygon points="21.25 22.47 2.92 22.47 2.92 17.45 0 17.45 0 25.39 24.17 25.39 24.17 17.45 21.25 17.45 21.25 22.47"/><polygon points="19.86 7.9 13.45 14.31 13.45 0 10.72 0 10.72 14.31 4.31 7.9 2.36 9.85 12.08 19.55 21.8 9.85 19.86 7.9"/></svg>
              </b-button>
            </b-button-group>
            <h3>Count Data</h3>
            <b-table :items="countData" small striped />
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <div
      v-if="requestStep > 1"
      class="card-bottom-close"
      @click="setRequestStepFromBreadcrumb(1)">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 19.58 19.62"><polygon points="16.81 0 9.79 7.02 2.77 0 0 2.81 6.98 9.83 0 16.85 2.77 19.62 9.79 12.64 16.81 19.62 19.58 16.85 12.61 9.83 19.58 2.81 16.81 0"/></svg>
    </div>
    <template v-if="locationQuery">
      <div
        class="card-bottom-body"
        :class="{confirm: requestStep === 3}">
        <b-row class="available-data mt-2">
          <template v-if="requestStep === 1">
            <b-col md="12">
              <h2>Available Data</h2>
            </b-col>
            <b-col md="7" class="align-self-center">
              <v-select
                v-model="countTypes"
                :options="optionsCountTypes"
                multiple
                placeholder="Select a type of study to filter results below" />
            </b-col>
            <b-col md="5" class="align-self-center">
              <span>
                at
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20.11 28.12" class="location-icon"><path d="M10.06,25.2C4.82,19.54,2,14.52,2,10.29a8.07,8.07,0,0,1,2.15-6A8.06,8.06,0,0,1,10.06,2a8,8,0,0,1,5.86,2.27,8.24,8.24,0,0,1,2.23,6C18.09,14.52,15.34,19.52,10.06,25.2ZM17.29,2.88A10.08,10.08,0,0,0,10.06,0,10.05,10.05,0,0,0,2.75,2.88,10,10,0,0,0,0,10.35c0,4.92,3.23,10.66,9.31,17l.73.75.72-.75c6.14-6.38,9.28-12,9.32-17A10,10,0,0,0,17.29,2.88Z"/><path d="M10.06,11.75a1.73,1.73,0,0,1-1.6-1.07A1.71,1.71,0,0,1,8.84,8.8a1.73,1.73,0,1,1,1.22,2.95Zm0-5.72a4,4,0,1,0,4,4A4,4,0,0,0,10.06,6Z"/></svg>
                <abbr
                  title="Kingston and Lee"
                  class="lead"
                  @mouseover="$emit('set-highlight-marker', true)"
                  @mouseout="$emit('set-highlight-marker', false)">Kingston and Lee</abbr>
              </span>
            </b-col>
          </template>
          <b-col v-else md="12">
            <span
              class="breadcrumb-step"
              :class="{active: requestStep === 1, completed: requestStep > 1}"
              @click="setRequestStepFromBreadcrumb(1)">
              Request
            </span>
            <breadcrumb-arrow
              :completed="requestStep > 1"
              :height="8"
              :width="444" />
            <span
              class="breadcrumb-step"
              :class="{active: requestStep === 2, completed: requestStep > 2}"
              @click="setRequestStepFromBreadcrumb(2)">
              Schedule
            </span>
            <breadcrumb-arrow
              :completed="requestStep > 2"
              :height="8"
              :width="444" />
            <span
              class="breadcrumb-step"
              :class="{active: requestStep === 3, completed: requestStep > 3}"
              @click="setRequestStepFromBreadcrumb(3)">
              Confirm
            </span>
          </b-col>
        </b-row>
        <template v-if="requestStep === 3">
          <b-row class="mt-2">
            <b-col md="10">
              <h3>Request Summary</h3>
            </b-col>
            <b-col md="2" class="text-right">
              <b-button
                variant="outline-secondary"
                @click="summaryPrint">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24.75 24.75"><path d="M22,0H2.75V6.88H0v11H2.75v6.87H22V17.88h2.75v-11H22ZM4.12,1.38h16.5v5.5H4.12Zm0,22V13.75h16.5v9.63Z"/><rect x="18.63" y="9.88" width="1.25" height="1.25"/><rect class="cls-1" x="6.13" y="14.88" width="12.5" height="1.25"/><rect class="cls-1" x="6.13" y="17.38" width="12.5" height="1.25"/></svg>
              </b-button>
            </b-col>
          </b-row>
          <b-row class="mt-2 pt-2">
            <b-col md="12">
              <p class="lead">
                Your reference number is: <strong>{{serviceRequestId}}</strong>
              </p>
            </b-col>
          </b-row>
        </template>
        <b-row v-if="requestStep > 1" class="pb-4">
          <b-col md="12">
            <span
              v-for="count in countsRequested"
              :key="count.id"
              class="count-selected-tag">
              {{count.type.label}}
            </span>
            at
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 20.11 28.12" class="location-icon"><path d="M10.06,25.2C4.82,19.54,2,14.52,2,10.29a8.07,8.07,0,0,1,2.15-6A8.06,8.06,0,0,1,10.06,2a8,8,0,0,1,5.86,2.27,8.24,8.24,0,0,1,2.23,6C18.09,14.52,15.34,19.52,10.06,25.2ZM17.29,2.88A10.08,10.08,0,0,0,10.06,0,10.05,10.05,0,0,0,2.75,2.88,10,10,0,0,0,0,10.35c0,4.92,3.23,10.66,9.31,17l.73.75.72-.75c6.14-6.38,9.28-12,9.32-17A10,10,0,0,0,17.29,2.88Z"/><path d="M10.06,11.75a1.73,1.73,0,0,1-1.6-1.07A1.71,1.71,0,0,1,8.84,8.8a1.73,1.73,0,1,1,1.22,2.95Zm0-5.72a4,4,0,1,0,4,4A4,4,0,0,0,10.06,6Z"/></svg>
            <abbr title="Kingston and Lee" class="lead">Kingston and Lee</abbr>
          </b-col>
        </b-row>
        <b-row v-if="requestStep === 1">
          <b-col md="12">
            <div class="card-bottom-table-wrapper overflow-auto">
              <b-card v-for="(section, index) in countsSections" :key="index" no-body class="mb-1">
                <b-card-header header-tag="header" class="p-1" role="tab">
                  <div class="card-bottom-table-toggle" v-b-toggle="`accordion_${index}`">
                    <div class="card-bottom-icon float-right when-opened">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 24.31 14.56"><polygon points="12.15 4.84 21.87 14.56 24.3 12.12 12.15 0 0 12.12 2.44 14.56 12.15 4.84"/></svg>
                    </div>
                    <div class="card-bottom-icon float-right when-closed">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="10" viewBox="0 0 24.31 14.56"><polygon points="12.15 9.71 2.44 0 0 2.44 12.15 14.56 24.3 2.44 21.87 0 12.15 9.71"/></svg>
                    </div>
                    <div
                      class="card-bottom-icon card-bottom-icon-status"
                      :class="`card-bottom-icon-${section.icon}`">
                      <b-img
                        :src="`/flashcrow/icons/${section.icon}-icon.svg`"
                        :alt="section.title" />
                    </div>
                    <h3>{{section.title}}</h3>
                  </div>
                </b-card-header>
                <b-collapse
                  :id="`accordion_${index}`"
                  :visible="index === 0"
                  accordion="acc-counts-sections"
                  role="tabpanel">
                  <b-card-body class="card-bottom-table-body">
                    <b-table
                      :fields="countFields"
                      :items="section.groupsByType"
                      :sort-compare="sortCompareCountFields"
                      small borderless>
                      <template slot="HEAD_requestNew" slot-scope="data">
                        <strong class="text-primary">{{ data.label }}</strong>
                      </template>
                      <template slot="type" slot-scope="data">
                        {{ data.item[0].type.label }}
                      </template>
                      <template slot="date" slot-scope="data">
                        <span v-if="data.item[0].date === null" class="text-muted">N/A</span>
                        <span v-else>{{ data.item[0].date | date }}</span>
                      </template>
                      <template slot="id" slot-scope="data">
                        <span v-if="data.item[0].id === null" class="text-muted">N/A</span>
                        <b-button
                          v-else
                          class="btn-count-view"
                          size="sm"
                          variant="outline-secondary"
                          @click="viewCount(data.item)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="15" viewBox="0 0 38.07 23.67"><path d="M28.66,17.21a14,14,0,0,1-19.25,0L3.83,11.84,9.41,6.59a14,14,0,0,1,19.25,0l5.58,5.25ZM30.57,4.6a16.76,16.76,0,0,0-23.06,0L0,11.84l7.51,7.23a16.74,16.74,0,0,0,23.06,0l7.5-7.23Z"/><path d="M19,14.46a2.62,2.62,0,1,1,2.72-2.62A2.66,2.66,0,0,1,19,14.46Zm0-7.87a5.34,5.34,0,0,0-5.44,5.25A5.34,5.34,0,0,0,19,17.08a5.35,5.35,0,0,0,5.44-5.24A5.35,5.35,0,0,0,19,6.59Z"/></svg>
                          </b-button>
                      </template>
                      <template slot="requestNew" slot-scope="data">
                        <b-form-checkbox
                          v-model="data.item[0].requestNew"
                          class="chk-request-new" />
                      </template>
                    </b-table>
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
          </b-col>
        </b-row>
        <template v-if="requestStep === 2">
          <b-row class="row-request-step-2 mb-3">
            <b-col md="4">
              <b-form-group
                label="*Service Request Number"
                label-for="input_service_request_id">
                <b-form-input
                  v-model.number="serviceRequestId"
                  id="input_service_request_id"
                  type="text"
                  placeholder="Customer Service Request ID"
                  required />
              </b-form-group>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="*Service Request Priority"
                label-for="input_service_request_priority">
                <b-form-radio-group
                  v-model.number="serviceRequestPriority"
                  id="input_service_request_priority"
                  buttons
                  button-variant="outline-primary"
                  :options="optionsServiceRequestPriority" />
              </b-form-group>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="Pick &quot;Receive By&quot; Date"
                label-for="input_delivery_date">
                <v-datepicker
                  v-model="deliveryDate"
                  id="input_delivery_date"
                  bootstrap-styling
                  :disabled-dates="deliveryDatesDisabled"
                  :format="datepickerFormat"
                  required />
              </b-form-group>
            </b-col>
            <b-col md="8" offset-md="4">
              <b-alert
                show
                :variant="serviceRequestPriority === 1 ? 'warning' : 'info'">
                <p v-if="serviceRequestPriority === 1">
                  You marked this <strong>urgent</strong>.  We might have to reschedule other
                  data requests to accommodate your request.  TSU will contact you with further
                  details once you've completed your request.
                </p>
                <p v-else-if="deliveryDate.valueOf() === deliveryDateNextAvailable.valueOf()">
                  You can expect to receive your data by {{ deliveryDateNextAvailable | date }}.
                  We've selected this date automatically for you, but you can change it if you have
                  scheduling requirements out of the norm.
                </p>
                <p v-else>
                  You've requested to receive your data by {{ deliveryDate | date }}.
                  If you don't have scheduling requirements out of the
                  norm, consider
                  <a
                    href="#"
                    @click.prevent="deliveryDate = deliveryDateNextAvailable">
                    <strong>using the next available date</strong>
                  </a>.
                </p>
              </b-alert>
            </b-col>
          </b-row>
          <count-details
            v-for="(count, index) in countsRequested"
            :count="count"
            :index="index"
            :key="count.id" />
          <b-row class="row-request-step-2 mt-3">
            <b-col md="12">
              <h2>Additional Details</h2>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="Reason for Request"
                label-for="input_reason">
                <v-select
                  v-model="reason"
                  id="input_reason"
                  :options="optionsReason" />
                <b-form-input
                  v-if="reason.value === null"
                  v-model="reasonOther"
                  type="text"
                  class="mt-1"
                  placeholder="Enter reason for your request" />
              </b-form-group>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="Additional Emails to Notify"
                label-for="input_additional_emails">
                <b-form-input
                  v-model="additionalEmails"
                  id="input_additional_emails"
                  type="text"
                  size="lg"
                  placeholder="e.g. shawn.dillon@toronto.ca" />
              </b-form-group>
            </b-col>
            <b-col md="4">
              <p class="lead">
                For <strong>Priority One</strong> requests or
                timing related details, the Traffic Safety Unit will
                contact you as soon as possible to discuss your request.
              </p>
            </b-col>
          </b-row>
        </template>
        <template v-if="requestStep === 3">
          <b-row class="row-request-step-2 pt-3 pb-3">
            <b-col md="4">
              <b-form-group
                label="Service Request Number">
                <p class="lead">
                  {{serviceRequestId}}
                </p>
              </b-form-group>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="Service Request Priority">
                <p class="lead">
                  Priority {{serviceRequestPriority}}
                </p>
              </b-form-group>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="Estimated Delivery Date">
                <p class="lead">
                  {{deliveryDate | date}}
                </p>
              </b-form-group>
            </b-col>
          </b-row>
          <count-details
            v-for="(count, index) in countsRequested"
            :count="count"
            :index="index"
            :key="count.id"
            summary />
          <b-row class="row-request-step-2 pt-4">
            <b-col md="12">
              <h2>Additional Details</h2>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="Reason for Request">
                <p class="lead">
                  <span v-if="reason.value === null">{{ reasonOther }}</span>
                  <span v-else>{{reason.label}}</span>
                </p>
              </b-form-group>
            </b-col>
            <b-col md="4">
              <b-form-group
                label="Additional Emails to Notify">
                <p class="lead">
                  {{additionalEmails}}
                </p>
              </b-form-group>
            </b-col>
            <b-col md="4">
              <p class="lead">
                For <strong>Priority One</strong> requests or
                timing related details, the Traffic Safety Unit will
                contact you as soon as possible to discuss your request.
              </p>
            </b-col>
          </b-row>
        </template>
      </div>
      <div v-if="locationQuery" class="request-step-action-wrapper">
        <b-button
          class="btn-request-step-action"
          size="lg"
          variant="primary"
          :disabled="disableRequestStepAction"
          @click="$emit('set-request-step', nextRequestStep)">
          {{ requestStepActionText }}
          <span
            v-if="requestStep === 1"
            class="badge badge-pill badge-light">{{ numCountsRequested }}</span>
        </b-button>
      </div>
    </template>
    <div v-else class="card-bottom-body">
      <p class="lead">
        Click on the search box to start the demo.
      </p>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-continue, no-alert */
import BreadcrumbArrow from '@/components/BreadcrumbArrow.vue';
import CountDetails from '@/components/CountDetails.vue';

class Random {
  static uniform(lo, hi) {
    return lo + (hi - lo) * Math.random();
  }

  static range(lo, hi) {
    return Math.floor(Random.uniform(lo, hi));
  }

  static choice(xs) {
    const n = xs.length;
    if (n === 0) {
      return null;
    }
    const i = Math.floor(Math.random() * n);
    return xs[i];
  }
}

const COUNT_TYPES = [
  { label: 'Turning Movement Count', value: 'TMC', automatic: false },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME', automatic: true },
  { label: 'Pedestrian Delay and Classification', value: 'PED_DELAY', automatic: false },
  { label: 'Pedestrian Crossover Observation', value: 'PXO_OBSERVE', automatic: false },
  { label: 'Volume ATR', value: 'ATR_VOLUME', automatic: true },
];

function randomType() {
  return Random.choice(COUNT_TYPES);
}

function randomDate(now) {
  const sevenYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000;
  const t = Random.range(sevenYearsAgo, now);
  return new Date(t);
}

const Status = {
  GOOD: 0,
  OLD: 1,
  MISSING: 2,
  REQUESTED: 3,
};

const STATUS_META = [
  { title: 'Current Counts', icon: 'checkmark' },
  { title: 'Expired Counts (more than 3 years old)', icon: 'warning' },
  { title: 'Missing Counts', icon: 'close' },
];

function getStatus(count, now) {
  const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
  if (count.date.valueOf() < threeYearsAgo) {
    return Status.OLD;
  }
  return Status.GOOD;
}

function randomCount(id, now) {
  const type = randomType();
  const date = randomDate(now);

  const count = {
    id,
    type,
    date,
    requestNew: false,
  };
  count.status = getStatus(count, now);
  return count;
}

function randomCounts() {
  const now = new Date().valueOf();
  const counts = [];
  let hasTmc = false;
  let id = 0;
  while (counts.length < 10 || !hasTmc) {
    id += 1;
    const count = randomCount(id, now);
    if (count.type.value === 'PED_DELAY') {
      continue;
    }
    if (count.type.value === 'TMC') {
      if (count.status === Status.GOOD) {
        continue;
      }
      hasTmc = true;
    }
    counts.push(count);
  }
  // create missing entries
  COUNT_TYPES.forEach((type) => {
    const hasCountOfType = counts.some(c => c.type === type);
    if (!hasCountOfType) {
      const countMissing = {
        id: null,
        type,
        date: null,
        requestNew: false,
        status: Status.MISSING,
      };
      counts.push(countMissing);
    }
  });

  return counts;
}

function sortBy(xs, key) {
  return xs.slice(0).sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka < kb) {
      return -1;
    }
    if (ka > kb) {
      return 1;
    }
    return 0;
  });
}

function groupBy(xs, g) {
  const groups = [];
  if (xs.length === 0) {
    return groups;
  }
  const xsSorted = sortBy(xs, g);
  let group = null;
  let gLast = null;
  xsSorted.forEach((x, i) => {
    const gx = g(x);
    if (i === 0 || gx > gLast) {
      group = [];
      gLast = gx;
      groups.push(group);
    }
    group.push(x);
  });
  return groups;
}

export default {
  name: 'CardBottom',
  components: {
    BreadcrumbArrow,
    CountDetails,
  },
  props: {
    locationQuery: String,
    requestStep: Number,
  },
  data() {
    const counts = randomCounts();
    return {
      additionalEmails: '',
      counts,
      countData: [
        { time: '07:00', n_cars_r: 6, etc: null },
        { time: '07:15', n_cars_r: 17, etc: null },
        { time: '07:30', n_cars_r: 42, etc: null },
        { time: '07:45', n_cars_r: 73, etc: null },
        { time: 'etc.', n_cars_r: null, etc: null },
      ],
      countFields: [
        { key: 'type', label: 'Type of Count', sortable: true },
        {
          key: 'date',
          label: 'Date Completed',
          sortable: true,
          class: 'text-center',
        },
        { key: 'id', label: 'View', class: 'text-center' },
        { key: 'requestNew', label: 'Request New', class: 'text-center' },
      ],
      countTypes: [],
      countViewed: null,
      countViewedIndexActive: 0,
      deliveryDate: new Date(2019, 3, 15),
      deliveryDateNextAvailable: new Date(2019, 3, 15),
      deliveryDatesDisabled: {
        to: new Date(2019, 3, 15),
      },
      optionsCountTypes: COUNT_TYPES,
      optionsReason: [
        { label: 'Traffic Safety Control', value: 'TCS' },
        { label: 'Pedestrian Crossover (PXO)', value: 'PXO' },
        { label: 'Updated count (3 years expired)', value: 'EXPIRED' },
        { label: 'Pedestrian Safety', value: 'PED_SAFETY' },
        { label: 'Signal Timing', value: 'SIGNAL_TIMING' },
        { label: 'Other', value: null },
      ],
      optionsServiceRequestPriority: [
        { text: 'PRI 1', value: 1 },
        { text: 'PRI 2', value: 2 },
        { text: 'PRI 3', value: 3 },
      ],
      reason: { label: 'Traffic Safety Control', value: 'TCS' },
      reasonOther: '',
      serviceRequestId: null,
      serviceRequestPriority: 3,
    };
  },
  computed: {
    countsFiltered() {
      if (this.countTypes.length === 0) {
        return this.counts;
      }
      const values = this.countTypes.map(type => type.value);
      return this.counts.filter(c => values.includes(c.type.value));
    },
    countsRequested() {
      return this.counts.filter(c => c.requestNew);
    },
    countsSections() {
      // group by type
      const countsByType = groupBy(this.countsFiltered, c => c.type.value);
      // sort groups by date
      const byType = countsByType
        .map(countsOfType => sortBy(countsOfType, c => -c.date.valueOf()));

      // group these by status
      const groupsByStatus = groupBy(byType, groupByType => groupByType[0].status);
      // add status metadata (title, icon)
      return groupsByStatus.map((groupsByType) => {
        const i = groupsByType[0][0].status;
        const { title, icon } = STATUS_META[i];
        const groupsByTypeSorted = sortBy(groupsByType, groupByType => groupByType[0].type.label);
        return {
          title,
          icon,
          groupsByType: groupsByTypeSorted,
        };
      }).filter(({ groupsByType }) => groupsByType.length > 0);
    },
    disableRequestStepAction() {
      if (this.requestStep === 1) {
        return this.numCountsRequested === 0;
      }
      if (this.requestStep === 2) {
        return !this.serviceRequestId;
      }
      return false;
    },
    nextRequestStep() {
      if (this.requestStep === 1) {
        return 2;
      }
      if (this.requestStep === 2) {
        return 3;
      }
      return 1;
    },
    numCountsRequested() {
      return this.countsRequested.length;
    },
    requestStepActionText() {
      if (this.requestStep === 1) {
        return 'Request New Data';
      }
      if (this.requestStep === 2) {
        return 'Continue';
      }
      return 'Confirm';
    },
    showModalView: {
      get() {
        return this.countViewed !== null;
      },
      set(value) {
        if (value === false) {
          this.countViewed = null;
          this.countViewedIndexActive = 0;
        }
      },
    },
    titleModalView() {
      if (this.countViewed === null) {
        return '';
      }
      const count = this.countViewed[0];
      return count.type.label;
    },
  },
  methods: {
    countViewedDownload() {
      window.alert('Coming soon: download raw count data!');
    },
    countViewedPrint() {
      window.alert('Coming soon: print count data!');
    },
    datepickerFormat(d) {
      // TODO: DRY with main.js Vue filter
      if (!d) {
        return '';
      }
      return new Intl.DateTimeFormat('en-US').format(d);
    },
    setRequestStepFromBreadcrumb(requestStep) {
      if (this.requestStep > requestStep) {
        this.$emit('set-request-step', requestStep);
      }
    },
    sortCompareCountFields(a, b, key) {
      let ka = a[0][key];
      let kb = b[0][key];
      if (key === 'date') {
        ka = ka.valueOf();
        kb = kb.valueOf();
      } else if (key === 'type') {
        ka = ka.label;
        kb = kb.label;
      }
      if (typeof ka === 'number' && typeof kb === 'number') {
        return ka - kb;
      }
      return ka.localeCompare(kb, undefined, {
        numeric: true,
      });
    },
    summaryPrint() {
      window.alert('Coming soon: print request summary!');
    },
    viewCount(count) {
      this.countViewed = count;
    },
  },
};
</script>

<style lang="postcss">
.card-bottom {
  background-color: #fafafa;
  bottom: 0;
  box-shadow: 0 10px 20px 0 rgba(46, 91, 255, 0.07);
  height: 400px;
  margin: 0 40px;
  position: absolute;
  transition: height 250ms ease-in-out;
  width: calc(100% - 80px);
  z-index: 100;
  &.card-bottom-full {
    height: 625px;
    .card-bottom-body {
      height: 555px;
    }
  }
  & > .card-bottom-close {
    cursor: pointer;
    position: absolute;
    right: 22px;
    top: 11px;
    & > svg > polygon {
      fill: #9b9b9b;
      transition: fill .15s ease-in-out;
    }
    &:hover > svg > polygon {
      fill: #796fe4;
    }
  }
}
.card-bottom-body {
  height: 330px;
  overflow-y: auto;
  padding: 22px 40px;
  &.confirm {
    fieldset > legend {
      font-weight: 500;
    }
    & > .row:nth-child(n+3) {
      background-color: white;
    }
  }
}
.request-step-action-wrapper {
  background-color: white;
  bottom: 0;
  box-shadow: 0px -3px 3px -1px #66666666;
  position: fixed;
  width: calc(100% - 80px);
  & > .btn-request-step-action {
    margin: 11px 40px 11px 40px;
    width: calc(100% - 80px);
  }
}
.card-header {
  background-color: #fff;
  cursor: pointer;
  transition: background-color 100ms ease-in-out;
  &:hover {
    background-color: #eee;
  }
}
.card-bottom-table-toggle {
  padding: 10px;
  & h3 {
    display: inline-block;
    margin-bottom: 0;
  }
}
.card-bottom-table-body {
  padding: 0;
  & > table {
    margin-left: 50px;
  }
}
.card-bottom-icon {
  background-color: white;
  border-radius: 16px;
  display: inline-block;
  height: 32px;
  transition: background-color 100ms ease-in-out;
  vertical-align: middle;
  width: 32px;
  & > img {
    margin: 5px 0;
  }
  &.float-right {
    background-color: black;
    & > svg {
      margin: 10px 8px;
    }
    & polygon {
      fill: white;
    }
  }
  &.card-bottom-icon-status {
    margin-right: 8px;
  }
  &.card-bottom-icon-checkmark {
    background-color: #a7a0f833;
    .card-header:hover & {
      background-color: #a7a0f87f;
    }
  }
  &.card-bottom-icon-warning {
    background-color: #f8e71c33;
    .card-header:hover & {
      background-color: #f8e71c7f;
    }
  }
  &.card-bottom-icon-close {
    background-color: #ff98a433;
    .card-header:hover & {
      background-color: #ff98a47f;
    }
  }
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
.breadcrumb-step {
  color: #9b9b9b;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1.7px;
  text-transform: uppercase;
  vertical-align: middle;
  &.active, &.active:hover {
    color: #4c41c9;
    cursor: default;
  }
  &.completed {
    color: #9b9b9b;
    cursor: pointer;
    transition: color .15s ease-in-out;
    &:hover {
      color: #796fe4;
    }
  }
}
.available-data {
  margin-bottom: 22px;
}
.row-request-step-2 .col-md-4 {
  padding-left: 27px;
  padding-right: 27px;
}
#input_service_request_priority {
  width: 100%;
}
#input_delivery_date.form-control[readonly] {
  background-color: white;
}
.vdp-datepicker__calendar .cell.selected {
  background-color: rgba(167, 160, 248, 0.20);
  &:hover {
    background-color: rgba(167, 160, 248, 0.60);
  }
}
.count-selected-tag {
  align-items: center;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333;
  display: inline-block;
  font-size: 1.25rem;
  line-height: 1.42857143;
  margin: 8px 4px 0;
  padding: 0 .25em;
  transition: opacity .25s;
}
.location-icon {
  margin: 0 8px;
}
#input_reason .clear {
  display: none;
}
.btn-outline-secondary {
  & > svg > path,
  & > svg > polygon,
  & > svg > rect {
    stroke: none;
    fill: #6c757d;
    transition: fill 0.15s ease-in-out;
  }
  &:hover > svg > path,
  &:hover > svg > polygon,
  &:hover > svg > rect {
    stroke: none;
    fill: white;
  }
}
</style>
