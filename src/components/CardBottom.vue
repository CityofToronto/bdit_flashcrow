<template>
  <div class="card-bottom" :class="{'with-map': requestStep === 1}">
    <b-modal
      v-model="showModalView"
      title="View Count"
      ok-only>
      <b-container fluid>
        <b-row>
          <b-col cols="12">
            <code>{{JSON.stringify(countViewed)}}</code>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-row>
      <template v-if="requestStep === 1">
        <b-col md="7" class="align-self-center">
          <v-select
            v-model="countTypes"
            :options="optionsCountTypes"
            multiple
            placeholder="All Counts">
          </v-select>
        </b-col>
        <b-col md="5" class="align-self-center">
          <span>
            at
            <b-img
              src="/flashcrow/icons/location-icon.svg"
              width="48"
              height="48" />
            <abbr title="Kingston and Lee" class="lead">Kingston and Lee</abbr>
          </span>
        </b-col>
      </template>
      <b-col v-else md="12">
        TODO: breadcrumbs
      </b-col>
      <template v-if="requestStep === 1">
        <b-col md="12">
          <div class="card-bottom-table-wrapper overflow-auto">
            <b-card v-for="(section, index) in countsSections" :key="index" no-body class="mb-1">
              <b-card-header header-tag="header" class="p-1" role="tab">
                <div class="card-bottom-table-toggle" v-b-toggle="`accordion_${index}`">
                  <b-img
                    class="card-bottom-icon float-right when-opened"
                    src="/flashcrow/icons/chevron-up-icon.svg"
                    alt="Close" />
                  <b-img
                    class="card-bottom-icon float-right when-closed"
                    src="/flashcrow/icons/chevron-down-icon.svg"
                    alt="Open" />
                  <b-img
                    class="card-bottom-icon card-bottom-icon-status"
                    :src="`/flashcrow/icons/${section.icon}-icon.svg`"
                    :alt="section.title" />
                  <span>{{section.title}}</span>
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
                    small borderless hover>
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
                        size="sm"
                        variant="outline-primary"
                        @click="viewCount(data.item)">
                        View
                        </b-button>
                    </template>
                    <template slot="requestNew" slot-scope="data">
                      <b-form-checkbox v-model="data.item[0].requestNew" />
                    </template>
                  </b-table>
                </b-card-body>
              </b-collapse>
            </b-card>
          </div>
        </b-col>
      </template>
      <template v-if="requestStep === 2">
        <b-col md="4">
          <b-form-group
            label="*Service Request Number"
            label-for="input_service_request_id">
            <b-form-input
              v-model.number="serviceRequestId"
              id="input_service_request_id"
              type="text" />
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
            label="Pick Delivery Date"
            label-for="input_delivery_date">
          </b-form-group>
        </b-col>
        <count-details
          v-for="(count, index) in countsRequested"
          :count="count"
          :index="index"
          :key="count.id" />
      </template>
      <template v-if="requestStep === 3">
      </template>
      <b-col md="12">
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
      </b-col>
    </b-row>
  </div>
</template>

<script>
/* eslint-disable no-continue */
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
  { label: 'Mid-Block Multi-Modal Traffic Count', value: 'MID_BLOCK_MULTI_MODAL', automatic: false },
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
  { title: 'Outdated Counts', icon: 'warning' },
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
    CountDetails,
  },
  props: {
    requestStep: Number,
  },
  data() {
    const counts = randomCounts();
    return {
      counts,
      countFields: [
        { key: 'type', label: 'Type of Count', sortable: true },
        { key: 'date', sortable: true },
        { key: 'id', label: 'View Existing' },
        { key: 'requestNew', label: 'Request New Data' },
      ],
      countTypes: [],
      countViewed: null,
      optionsCountTypes: COUNT_TYPES,
      optionsServiceRequestPriority: [
        { text: 'PRI1', value: 1 },
        { text: 'PRI2', value: 2 },
        { text: 'PRI3', value: 3 },
      ],
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
        return {
          title,
          icon,
          groupsByType,
        };
      }).filter(({ groupsByType }) => groupsByType.length > 0);
    },
    disableRequestStepAction() {
      if (this.requestStep === 1) {
        return this.numCountsRequested === 0;
      }
      if (this.requestStep === 2) {
        return false;
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
        }
      },
    },
  },
  methods: {
    viewCount(count) {
      this.countViewed = count;
    },
  },
};
</script>

<style lang="postcss">
.card-bottom {
  flex-grow: 1;
  padding: 8px;
  &.with-map {
    flex-grow: unset;
    height: 400px;
  }
}
.card-bottom-table-wrapper {
  height: 280px;
}
.card-bottom-table-body {
  padding: 0;
}
.btn-request-step-action {
  margin-top: 8px;
  width: 100%;
}
.card-bottom-icon {
  background-color: white;
  border-radius: 16px;
  height: 32px;
  width: 32px;
  &.card-bottom-icon-status {
    margin-right: 8px;
  }
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
