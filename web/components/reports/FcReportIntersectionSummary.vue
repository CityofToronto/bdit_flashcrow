<template>
  <div class="fc-report-intersection-warrant-summary">
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
          <th class="br" colspan="3">NORTHBOUND</th>
          <th class="br" colspan="3">EASTBOUND</th>
          <th class="br" colspan="3">SOUTHBOUND</th>
          <th class="br" colspan="3">WESTBOUND</th>
          <th class="br" colspan="4">BICYCLES</th>
          <th class="br" colspan="4">OTHER</th>
          <th class="br" colspan="2">MAJOR CROSSINGS</th>
          <th class="br" colspan="2">APPROACHES</th>
          <th rowspan="2">TOTAL</th>
        </tr>
        <tr>
          <template v-for="dir in dirs">
            <th :key="dir + '_L_TH'">Left</th>
            <th :key="dir + '_T_TH'">Thru</th>
            <th
              :key="dir + '_R_TH'"
              class="br">Right</th>
          </template>
          <th
            v-for="dir in dirs"
            :key="dir + '_BIKE_TH'"
            :class="{ br: dir === 'W' }">{{dir}}</th>
          <th
            v-for="dir in dirs"
            :key="dir + '_OTHER_TH'"
            :class="{ br: dir === 'W' }">{{dir}}</th>
          <th>Peds</th>
          <th class="br">All</th>
          <th>Major</th>
          <th class="br">Minor</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(hourTotals, hour) in reportData.hourlyTotals"
          :key="hour">
          <th class="br">
            {{timeRanges[hour].start | timeOfDay}}&ndash;{{timeRanges[hour].end | timeOfDay}}
          </th>
          <template v-for="dir in dirs">
            <td
              v-for="turn in turns"
              :key="dir + '_' + turn"
              :class="{ br: turn === 'R' }">
              {{hourTotals[dir + '_' + turn]}}
            </td>
          </template>
          <td
            v-for="dir in dirs"
            :key="dir + '_BIKE'"
            :class="{ br: dir === 'W' }">
            {{hourTotals[dir + '_BIKE']}}
          </td>
          <td
            v-for="dir in dirs"
            :key="dir + '_OTHER'"
            :class="{ br: dir === 'W' }">
            {{hourTotals[dir + '_OTHER']}}
          </td>
          <td>{{hourTotals.MAJOR_CROSSING_PEDS}}</td>
          <td class="br">{{hourTotals.MAJOR_CROSSING_TOTAL}}</td>
          <td>{{hourTotals.MAJOR_APPROACHES}}</td>
          <td class="br">{{hourTotals.MINOR_APPROACHES}}</td>
          <td>{{hourTotals.TOTAL}}</td>
        </tr>
        <tr>
          <th class="br bt">8 Hour Total</th>
          <template v-for="dir in dirs">
            <td
              v-for="turn in turns"
              :key="dir + '_' + turn"
              :class="{ br: turn === 'R', bt: true }">
              {{reportData.totals[dir + '_' + turn]}}
            </td>
          </template>
          <td
            v-for="dir in dirs"
            :key="dir + '_BIKE'"
            :class="{ br: dir === 'W', bt: true }">
            {{reportData.totals[dir + '_BIKE']}}
          </td>
          <td
            v-for="dir in dirs"
            :key="dir + '_OTHER'"
            :class="{ br: dir === 'W', bt: true }">
            {{reportData.totals[dir + '_OTHER']}}
          </td>
          <td class="bt">{{reportData.totals.MAJOR_CROSSING_PEDS}}</td>
          <td class="br bt">{{reportData.totals.MAJOR_CROSSING_TOTAL}}</td>
          <td class="bt">{{reportData.totals.MAJOR_APPROACHES}}</td>
          <td class="br bt">{{reportData.totals.MINOR_APPROACHES}}</td>
          <td class="bt">{{reportData.totals.TOTAL}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FcReportIntersectionSummary',
  props: {
    count: Object,
    reportData: Object,
  },
  data() {
    return {
      dirs: ['N', 'E', 'S', 'W'],
      turns: ['L', 'T', 'R'],
    };
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
    timeRanges() {
      return this.reportData.timeRanges.map((timeRange) => {
        let { start, end } = timeRange;
        start = new Date(start.slice(0, -1));
        end = new Date(end.slice(0, -1));
        return { start, end };
      });
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-intersection-warrant-summary {
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
    & > tbody {
      & > tr > td {
        padding: var(--space-xs) var(--space-s);
        text-align: right;
      }
      & > tr:nth-child(2n) {
        background-color: var(--base-lighter);
      }
    }
  }
}
</style>
