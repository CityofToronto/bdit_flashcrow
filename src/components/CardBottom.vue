<template>
  <div class="card-bottom">
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
        <b-col md="12">
          <b-button
            class="btn-request-step-action"
            size="lg"
            variant="primary"
            :disabled="numRequested === 0"
            @click="$emit('set-request-step', 2)">
            Request New Data
            <span class="badge badge-pill badge-light">{{ numRequested }}</span>
          </b-button>
        </b-col>
      </template>
      <template v-if="requestStep === 2">
        <b-col md="12">
          <b-button
            class="btn-request-step-action"
            size="lg"
            variant="primary"
            @click="$emit('set-request-step', 3)">
            Continue
          </b-button>
        </b-col>
      </template>
      <template v-if="requestStep === 3">
        <b-col md="12">
          <b-button
            class="btn-request-step-action"
            size="lg"
            variant="primary"
            @click="$emit('set-request-step', 1)">
            Confirm
          </b-button>
        </b-col>
      </template>
    </b-row>
  </div>
</template>

<script>
/* eslint-disable no-continue */
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
  { label: 'Turning Movement Count', value: 'TMC' },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME' },
  { label: 'Pedestrian Delay and Classification', value: 'PED_DELAY' },
  { label: 'Pedestrian Crossover Observation', value: 'PXO_OBSERVE' },
  { label: 'Mid-Block Multi-Modal Traffic Count', value: 'MID_BLOCK_MULTI_MODAL' },
  { label: 'Volume ATR', value: 'ATR_VOLUME' },
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
    numRequested() {
      return this.counts.filter(c => c.requestNew).length;
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
  height: 400px;
  padding: 8px;
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
