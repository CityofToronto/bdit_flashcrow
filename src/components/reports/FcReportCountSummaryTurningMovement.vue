<template>
  <section class="fc-report-tmc-summary">
    <header class="py-m">
      <div>
        <strong>{{locationQuery}}</strong>
      </div>
      <div>
        <strong>Survey Type: </strong>
        <span>{{hoursHuman}}</span>
      </div>
    </header>
    <table class="my-m">
      <thead>
        <tr>
          <th class="br" rowspan="2">Time Period</th>
          <th rowspan="2">Vehicle Type</th>
          <th class="bl" colspan="5">NORTHBOUND</th>
          <th class="bl" colspan="5">EASTBOUND</th>
          <th class="bl" colspan="5">SOUTHBOUND</th>
          <th class="bl" colspan="5">WESTBOUND</th>
          <th class="bl" rowspan="2"></th>
          <th colspan="3"></th>
        </tr>
        <tr>
          <template v-for="i in 4">
            <th
              :key="i + '_EXITS'"
              class="bl">Exits</th>
            <th :key="i + '_L'">Left</th>
            <th :key="i + '_T'">Thru</th>
            <th :key="i + '_R'">Right</th>
            <th :key="i + '_TOTAL'">Total</th>
          </template>
          <th>Peds</th>
          <th>Bike</th>
          <th>Other</th>
        </tr>
      </thead>
      <FcReportCountSummaryTurningMovementSection
        :section-data="sumAmPeak"
        :time-range="timeRangeAmPeak"
        title="AM PEAK" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="sumPmPeak"
        :time-range="timeRangePmPeak"
        title="PM PEAK" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="avgOffHours"
        :time-range="timeRangeOffHours"
        title="OFF HOUR AVG" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="sumAm2Hour"
        :time-range="timeRangeAm2Hour"
        title="2 HR AM" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="sumPm2Hour"
        :time-range="timeRangePm2Hour"
        title="2 HR PM" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="sum8Hour"
        :time-range="timeRange8Hour"
        title="8 HR SUM" />
    </table>
    <footer>
      <div>
        <strong>Total 8 Hour Vehicle Volume: </strong>
        <span>{{sum8Hour.VEHICLE_TOTAL}}</span>
      </div>
      <div>
        <strong>Total 8 Hour Bicycle Volume: </strong>
        <span>{{sum8Hour.BIKE_TOTAL}}</span>
      </div>
      <div>
        <strong>Total 8 Hour Intersection Volume: </strong>
        <span>{{sum8Hour.TOTAL}}</span>
      </div>
    </footer>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import FcReportCountSummaryTurningMovementSection from
  '@/components/reports/FcReportCountSummaryTurningMovementSection.vue';
import ArrayUtils from '@/lib/ArrayUtils';

function normalizeData(rawData) {
  const data = Object.assign({}, rawData);

  // directional totals, by type of vehicle
  data.N_CARS_TOTAL = data.N_CARS_R + data.N_CARS_T + data.N_CARS_L;
  data.E_CARS_TOTAL = data.E_CARS_R + data.E_CARS_T + data.E_CARS_L;
  data.S_CARS_TOTAL = data.S_CARS_R + data.S_CARS_T + data.S_CARS_L;
  data.W_CARS_TOTAL = data.W_CARS_R + data.W_CARS_T + data.W_CARS_L;

  data.N_TRUCK_TOTAL = data.N_TRUCK_R + data.N_TRUCK_T + data.N_TRUCK_L;
  data.E_TRUCK_TOTAL = data.E_TRUCK_R + data.E_TRUCK_T + data.E_TRUCK_L;
  data.S_TRUCK_TOTAL = data.S_TRUCK_R + data.S_TRUCK_T + data.S_TRUCK_L;
  data.W_TRUCK_TOTAL = data.W_TRUCK_R + data.W_TRUCK_T + data.W_TRUCK_L;

  data.N_BUS_TOTAL = data.N_BUS_R + data.N_BUS_T + data.N_BUS_L;
  data.E_BUS_TOTAL = data.E_BUS_R + data.E_BUS_T + data.E_BUS_L;
  data.S_BUS_TOTAL = data.S_BUS_R + data.S_BUS_T + data.S_BUS_L;
  data.W_BUS_TOTAL = data.W_BUS_R + data.W_BUS_T + data.W_BUS_L;

  // directional exits, by type of vehicle
  data.N_CARS_EXITS = data.E_CARS_R + data.S_CARS_T + data.W_CARS_L;
  data.E_CARS_EXITS = data.S_CARS_R + data.W_CARS_T + data.N_CARS_L;
  data.S_CARS_EXITS = data.W_CARS_R + data.N_CARS_T + data.E_CARS_L;
  data.W_CARS_EXITS = data.N_CARS_R + data.E_CARS_T + data.S_CARS_L;

  data.N_TRUCK_EXITS = data.E_TRUCK_R + data.S_TRUCK_T + data.W_TRUCK_L;
  data.E_TRUCK_EXITS = data.S_TRUCK_R + data.W_TRUCK_T + data.N_TRUCK_L;
  data.S_TRUCK_EXITS = data.W_TRUCK_R + data.N_TRUCK_T + data.E_TRUCK_L;
  data.W_TRUCK_EXITS = data.N_TRUCK_R + data.E_TRUCK_T + data.S_TRUCK_L;

  data.N_BUS_EXITS = data.E_BUS_R + data.S_BUS_T + data.W_BUS_L;
  data.E_BUS_EXITS = data.S_BUS_R + data.W_BUS_T + data.N_BUS_L;
  data.S_BUS_EXITS = data.W_BUS_R + data.N_BUS_T + data.E_BUS_L;
  data.W_BUS_EXITS = data.N_BUS_R + data.E_BUS_T + data.S_BUS_L;

  // turning movement totals, all vehicles combined
  data.N_VEHICLE_R = data.N_CARS_R + data.N_TRUCK_R + data.N_BUS_R;
  data.E_VEHICLE_R = data.E_CARS_R + data.E_TRUCK_R + data.E_BUS_R;
  data.S_VEHICLE_R = data.S_CARS_R + data.S_TRUCK_R + data.S_BUS_R;
  data.W_VEHICLE_R = data.W_CARS_R + data.W_TRUCK_R + data.W_BUS_R;

  data.N_VEHICLE_T = data.N_CARS_T + data.N_TRUCK_T + data.N_BUS_T;
  data.E_VEHICLE_T = data.E_CARS_T + data.E_TRUCK_T + data.E_BUS_T;
  data.S_VEHICLE_T = data.S_CARS_T + data.S_TRUCK_T + data.S_BUS_T;
  data.W_VEHICLE_T = data.W_CARS_T + data.W_TRUCK_T + data.W_BUS_T;

  data.N_VEHICLE_L = data.N_CARS_L + data.N_TRUCK_L + data.N_BUS_L;
  data.E_VEHICLE_L = data.E_CARS_L + data.E_TRUCK_L + data.E_BUS_L;
  data.S_VEHICLE_L = data.S_CARS_L + data.S_TRUCK_L + data.S_BUS_L;
  data.W_VEHICLE_L = data.W_CARS_L + data.W_TRUCK_L + data.W_BUS_L;

  // directional exit totals, all vehicles combined
  data.N_VEHICLE_EXITS = data.N_CARS_EXITS + data.N_TRUCK_EXITS + data.N_BUS_EXITS;
  data.E_VEHICLE_EXITS = data.E_CARS_EXITS + data.E_TRUCK_EXITS + data.E_BUS_EXITS;
  data.S_VEHICLE_EXITS = data.S_CARS_EXITS + data.S_TRUCK_EXITS + data.S_BUS_EXITS;
  data.W_VEHICLE_EXITS = data.W_CARS_EXITS + data.W_TRUCK_EXITS + data.W_BUS_EXITS;

  // directional totals, all vehicles combined
  data.N_VEHICLE_TOTAL = data.N_CARS_TOTAL + data.N_TRUCK_TOTAL + data.N_BUS_TOTAL;
  data.E_VEHICLE_TOTAL = data.E_CARS_TOTAL + data.E_TRUCK_TOTAL + data.E_BUS_TOTAL;
  data.S_VEHICLE_TOTAL = data.S_CARS_TOTAL + data.S_TRUCK_TOTAL + data.S_BUS_TOTAL;
  data.W_VEHICLE_TOTAL = data.W_CARS_TOTAL + data.W_TRUCK_TOTAL + data.W_BUS_TOTAL;

  // modal totals, including peds / bikes
  data.VEHICLE_TOTAL = data.N_VEHICLE_TOTAL
    + data.E_VEHICLE_TOTAL
    + data.S_VEHICLE_TOTAL
    + data.W_VEHICLE_TOTAL;
  data.PEDS_TOTAL = data.N_PEDS + data.E_PEDS + data.S_PEDS + data.W_PEDS;
  data.BIKE_TOTAL = data.N_BIKE + data.E_BIKE + data.S_BIKE + data.W_BIKE;
  data.OTHER_TOTAL = data.N_OTHER + data.E_OTHER + data.S_OTHER + data.W_OTHER;

  // overall total
  data.TOTAL = data.VEHICLE_TOTAL + data.PEDS_TOTAL + data.BIKE_TOTAL + data.OTHER_TOTAL;

  return data;
}

function sumIndicesRaw(countData, is) {
  const sum = {};
  is.forEach((i, j) => {
    Object.entries(countData[i].data).forEach(([key, value]) => {
      if (j === 0) {
        sum[key] = 0;
      }
      sum[key] += value;
    });
  });
  return sum;
}

function avgIndices(countData, is) {
  const sum = sumIndicesRaw(countData, is);
  const n = is.length;
  const avg = {};
  Object.entries(sum).forEach(([key, value]) => {
    avg[key] = Math.round(4 * value / n);
  });
  return normalizeData(avg);
}

function sumIndices(countData, is) {
  const sum = sumIndicesRaw(countData, is);
  return normalizeData(sum);
}

/*
 * Compute the starting index of the peak hour between lo and hi.
 * It is assumed that [lo, hi) defines a sequence of back-to-back
 * 15-minute buckets.
 */
function peakIndex(countData, lo, hi) {
  let peakVolume = -Infinity;
  let peak = null;
  for (let i = lo; i < hi - 4; i += 1) {
    const is = ArrayUtils.range(i, i + 4);
    const sum = sumIndices(countData, is);
    if (sum.TOTAL > peakVolume) {
      peakVolume = sum.TOTAL;
      peak = i;
    }
  }
  return peak;
}

function timeRange(countData, is) {
  const n = is.length;
  const indexStart = is[0];
  const indexEnd = is[n - 1];
  let { t: start } = countData[indexStart];
  const { t: end } = countData[indexEnd];
  start = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes() - 15,
    start.getSeconds(),
  );
  return { start, end };
}

export default {
  name: 'FcReportTmcSummary',
  components: {
    FcReportCountSummaryTurningMovementSection,
  },
  props: {
    count: Object,
    countData: Array,
  },
  computed: {
    hoursHuman() {
      const { hours } = this.count;
      if (hours === 'ROUTINE') {
        return 'Routine Hours';
      }
      if (hours === 'SCHOOL') {
        return 'School Hours';
      }
      return 'Other Hours';
    },
    indexAmPeak() {
      return peakIndex(this.countData, 0, 8);
    },
    indicesOffHours() {
      return ArrayUtils.range(8, 24);
    },
    indexPmPeak() {
      return peakIndex(this.countData, 24, 32);
    },
    sum8Hour() {
      const is = ArrayUtils.range(32);
      return sumIndices(this.countData, is);
    },
    sumAm2Hour() {
      const is = ArrayUtils.range(0, 8);
      return sumIndices(this.countData, is);
    },
    sumAmPeak() {
      const is = ArrayUtils.range(this.indexAmPeak, this.indexAmPeak + 4);
      return sumIndices(this.countData, is);
    },
    avgOffHours() {
      const is = ArrayUtils.range(8, 24);
      return avgIndices(this.countData, is);
    },
    sumPm2Hour() {
      const is = ArrayUtils.range(24, 32);
      return sumIndices(this.countData, is);
    },
    sumPmPeak() {
      const is = ArrayUtils.range(this.indexPmPeak, this.indexPmPeak + 4);
      return sumIndices(this.countData, is);
    },
    timeRange8Hour() {
      const is = ArrayUtils.range(32);
      return timeRange(this.countData, is);
    },
    timeRangeAm2Hour() {
      const is = ArrayUtils.range(0, 8);
      return timeRange(this.countData, is);
    },
    timeRangeAmPeak() {
      const is = ArrayUtils.range(this.indexAmPeak, this.indexAmPeak + 4);
      return timeRange(this.countData, is);
    },
    timeRangeOffHours() {
      const is = ArrayUtils.range(8, 24);
      return timeRange(this.countData, is);
    },
    timeRangePm2Hour() {
      const is = ArrayUtils.range(24, 32);
      return timeRange(this.countData, is);
    },
    timeRangePmPeak() {
      const is = ArrayUtils.range(this.indexPmPeak, this.indexPmPeak + 4);
      return timeRange(this.countData, is);
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-tmc-summary {
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 1600px;
    & > thead {
      background-color: var(--base-lighter);
      & > tr > th {
        padding: var(--space-xs) var(--space-s);
      }
    }
    & > tbody:nth-child(4n) {
      background-color: var(--base-lighter);
    }
    & > tr.fc-report-tmc-summary-spacer {
      height: var(--space-l);
    }
  }
}
</style>
