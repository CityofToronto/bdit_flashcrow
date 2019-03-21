<template>
  <div class="card-bottom">
    <b-row>
      <b-col md="4">
        <b-form-select
          v-model="countType"
          :options="optionsCountTypes"
          primary-key="id" />
      </b-col>
      <b-col md="8" class="align-self-center">
        <span>at <abbr title="Kingston and Lee" class="lead">Kingston and Lee</abbr></span>
      </b-col>
      <b-col md="12">
        <div class="card-bottom-table-wrapper overflow-auto">
          <b-card v-for="(section, index) in countsSections" :key="index" no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <div class="text-left" v-b-toggle="`accordion_${index}`">{{section.title}}</div>
            </b-card-header>
            <b-collapse
              :id="`accordion_${index}`"
              visible
              accordion="acc-counts-sections"
              role="tabpanel">
              <b-card-body class="card-bottom-table-body">
                <b-table
                  :fields="countFields"
                  :items="section.counts"
                  small borderless hover>
                  <template slot="type" slot-scope="data">
                    {{ data.value.text }}
                  </template>
                  <template slot="date" slot-scope="data">
                    {{ data.value | date }}
                  </template>
                  <template slot="id" slot-scope="data">
                    <span v-if="data.item.id === null" class="text-muted">N/A</span>
                    <b-button
                      v-else
                      size="sm"
                      variant="outline-primary"
                      @click="viewCount(data.item)">View</b-button>
                  </template>
                  <template slot="requestNew" slot-scope="data">
                    <b-form-checkbox v-model="data.item.requestNew" />
                  </template>
                </b-table>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </b-col>
      <b-col md="12">
        <b-button
          class="btn-request-data"
          size="lg"
          variant="primary"
          :disabled="numRequested === 0">Request Data (<span>{{ numRequested }}</span>)</b-button>
      </b-col>
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
  { text: 'Turning Movement Count', value: 'TMC' },
  { text: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME' },
  { text: 'Pedestrian Delay and Classification', value: 'PED_DELAY' },
  { text: 'Pedestrian Crossover Observation', value: 'PXO_OBSERVE' },
  { text: 'Mid-Block Multi-Modal Traffic Count', value: 'MID_BLOCK_MULTI_MODAL' },
  { text: 'Volume ATR', value: 'ATR_VOLUME' },
];

const OPTIONS_COUNT_TYPES = COUNT_TYPES.slice(0);
OPTIONS_COUNT_TYPES.unshift({ text: 'All Counts', value: null });

function randomType() {
  return Random.choice(COUNT_TYPES);
}

function randomDate(now) {
  const sevenYearsAgo = now - 7 * 365 * 24 * 60 * 60 * 1000;
  const t = Random.range(sevenYearsAgo, now);
  return new Date(t);
}

const Status = {
  GOOD: 0,
  OLD: 1,
  MISSING: 2,
  REQUESTED: 3,
};

const STATUS_TITLES = [
  'Current Data',
  'Outdated Data',
  'Missing Data',
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
      countType: null,
      optionsCountTypes: OPTIONS_COUNT_TYPES,
    };
  },
  computed: {
    countsFiltered() {
      if (this.countType === null) {
        return this.counts;
      }
      return this.counts.filter(c => c.type.value === this.countType);
    },
    countsSections() {
      const groups = groupBy(this.countsFiltered, c => c.status);
      return groups.map((group) => {
        const i = group[0].status;
        const title = STATUS_TITLES[i];
        return {
          title,
          counts: group,
        };
      });
    },
    numRequested() {
      return this.counts.filter(c => c.requestNew).length;
    },
  },
  methods: {
    viewCount(count) {
      window.alert(`viewing count ${JSON.stringify(count)}`);
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
  margin-top: 8px;
}
.card-bottom-table-body {
  padding: 0;
}
.btn-request-data {
  margin-top: 8px;
  width: 100%;
}
</style>
