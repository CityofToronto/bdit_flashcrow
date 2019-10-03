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
        :section-data="reportData.amPeak.sum"
        :time-range="reportData.amPeak.timeRange"
        title="AM PEAK" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="reportData.pmPeak.sum"
        :time-range="reportData.pmPeak.timeRange"
        title="PM PEAK" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="reportData.offHours.avg"
        :time-range="reportData.offHours.timeRange"
        title="OFF HOUR AVG" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="reportData.am.sum"
        :time-range="reportData.am.timeRange"
        title="2 HR AM" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="reportData.pm.sum"
        :time-range="reportData.pm.timeRange"
        title="2 HR PM" />
      <tr class="fc-report-tmc-summary-spacer">
        <td colspan="26"></td>
      </tr>
      <FcReportCountSummaryTurningMovementSection
        :section-data="reportData.all.sum"
        :time-range="reportData.all.timeRange"
        title="8 HR SUM" />
    </table>
    <footer>
      <div>
        <strong>Total 8 Hour Vehicle Volume: </strong>
        <span>{{reportData.all.sum.VEHICLE_TOTAL}}</span>
      </div>
      <div>
        <strong>Total 8 Hour Bicycle Volume: </strong>
        <span>{{reportData.all.sum.BIKE_TOTAL}}</span>
      </div>
      <div>
        <strong>Total 8 Hour Intersection Volume: </strong>
        <span>{{reportData.all.sum.TOTAL}}</span>
      </div>
    </footer>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import FcReportCountSummaryTurningMovementSection from
  '@/web/components/reports/FcReportCountSummaryTurningMovementSection.vue';

export default {
  name: 'FcReportCountSummaryTurningMovement',
  components: {
    FcReportCountSummaryTurningMovementSection,
  },
  props: {
    count: Object,
    reportData: Object,
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
