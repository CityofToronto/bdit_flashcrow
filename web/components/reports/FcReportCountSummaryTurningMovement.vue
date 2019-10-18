<template>
  <section class="fc-report-tmc-summary">
    <header class="py-m">
      <div>
        <strong>{{count.locationDesc}}</strong>
      </div>
      <div>
        <strong>Survey Type: </strong>
        <span>{{hoursHuman}}</span>
      </div>
    </header>
    <FcReportTable v-bind="tableLayout" />
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

import TimeFormatters from '@/lib/time/TimeFormatters';
import FcReportTable from
  '@/web/components/reports/FcReportTable.vue';

function getTimeRangeHuman(timeRange) {
  let { start, end } = timeRange;
  start = new Date(start.slice(0, -1));
  end = new Date(end.slice(0, -1));
  return TimeFormatters.formatRangeTimeOfDay({ start, end });
}

function getTableHeader() {
  const dirs = [
    { value: 'Exits', style: { bl: true } },
    { value: 'Left' },
    { value: 'Thru' },
    { value: 'Right' },
    { value: 'Total' },
  ];
  return [
    [
      {
        value: 'Time Period',
        rowspan: 2,
        style: { br: true },
      },
      {
        value: 'Vehicle Type',
        rowspan: 2,
      },
      {
        value: 'NORTHBOUND',
        colspan: 5,
        style: { bl: true },
      },
      {
        value: 'EASTBOUND',
        colspan: 5,
        style: { bl: true },
      },
      {
        value: 'SOUTHBOUND',
        colspan: 5,
        style: { bl: true },
      },
      {
        value: 'WESTBOUND',
        colspan: 5,
        style: { bl: true },
      },
      {
        value: null,
        rowspan: 2,
        style: { bl: true },
      },
      {
        value: null,
        colspan: 3,
      },
    ],
    [
      ...dirs,
      ...dirs,
      ...dirs,
      ...dirs,
      { value: 'Peds' },
      { value: 'Bike' },
      { value: 'Other' },
    ],
  ];
}

function getTableSectionLayout(sectionData, timeRange, title) {
  const timeRangeHuman = getTimeRangeHuman(timeRange);
  const dirs = ['N', 'E', 'S', 'W'];
  const turns = ['L', 'T', 'R', 'TOTAL'];
  return [
    [
      {
        value: timeRangeHuman,
        header: true,
        rowspan: 2,
        style: { br: true },
      },
      { value: 'CAR', header: true },
      ...Array.prototype.concat.apply([], dirs.map(dir => [
        {
          value: sectionData[`${dir}_CARS_EXITS`],
          style: { bl: true },
        },
        ...turns.map(turn => ({ value: sectionData[`${dir}_CARS_${turn}`] })),
      ])),
      { value: 'N', header: true, style: { bl: true } },
      { value: sectionData.N_PEDS },
      { value: sectionData.N_BIKE },
      { value: sectionData.N_OTHER },
    ],
    [
      { value: 'TRUCK', header: true },
      ...Array.prototype.concat.apply([], dirs.map(dir => [
        {
          value: sectionData[`${dir}_TRUCK_EXITS`],
          style: { bl: true },
        },
        ...turns.map(turn => ({ value: sectionData[`${dir}_TRUCK_${turn}`] })),
      ])),
      { value: 'S', header: true, style: { bl: true } },
      { value: sectionData.S_PEDS },
      { value: sectionData.S_BIKE },
      { value: sectionData.S_OTHER },
    ],
    [
      { value: title, header: true, style: { br: true } },
      { value: 'BUS', header: true },
      ...Array.prototype.concat.apply([], dirs.map(dir => [
        {
          value: sectionData[`${dir}_BUS_EXITS`],
          style: { bl: true },
        },
        ...turns.map(turn => ({ value: sectionData[`${dir}_BUS_${turn}`] })),
      ])),
      { value: 'E', header: true, style: { bl: true } },
      { value: sectionData.E_PEDS },
      { value: sectionData.E_BIKE },
      { value: sectionData.E_OTHER },
    ],
    [
      { value: null, header: true, style: { br: true } },
      { value: null, header: true },
      ...Array.prototype.concat.apply([], dirs.map(() => [
        { value: null, style: { bl: true } },
        ...turns.map(() => ({ value: null })),
      ])),
      { value: 'W', header: true, style: { bl: true } },
      { value: sectionData.W_PEDS },
      { value: sectionData.W_BIKE },
      { value: sectionData.W_OTHER },
    ],
    [
      { value: null, header: true, style: { br: true } },
      { value: 'TOTAL', header: true, style: { bt: true } },
      ...Array.prototype.concat.apply([], dirs.map(dir => [
        {
          value: sectionData[`${dir}_VEHICLE_EXITS`],
          style: { bt: true, bl: true },
        },
        ...turns.map(turn => ({
          value: sectionData[`${dir}_VEHICLE_${turn}`],
          style: { bt: true },
        })),
      ])),
      { value: null, header: true, style: { bt: true, bl: true } },
      { value: sectionData.PEDS_TOTAL, style: { bt: true } },
      { value: sectionData.BIKE_TOTAL, style: { bt: true } },
      { value: sectionData.OTHER_TOTAL, style: { bt: true } },
    ],
  ];
}

export default {
  name: 'FcReportCountSummaryTurningMovement',
  components: {
    FcReportTable,
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
    tableLayout() {
      /* eslint-disable prefer-destructuring */
      const reportData = this.reportData;
      const header = getTableHeader();
      const body = [
        ...getTableSectionLayout(
          reportData.amPeak.sum,
          reportData.amPeak.timeRange,
          'AM PEAK',
        ),
        [{ value: null, colspan: 26 }],
        ...getTableSectionLayout(
          reportData.pmPeak.sum,
          reportData.pmPeak.timeRange,
          'PM PEAK',
        ),
        [{ value: null, colspan: 26 }],
        ...getTableSectionLayout(
          reportData.offHours.avg,
          reportData.offHours.timeRange,
          'OFF HOUR AVG',
        ),
        [{ value: null, colspan: 26 }],
        ...getTableSectionLayout(
          reportData.am.sum,
          reportData.am.timeRange,
          '2 HR AM',
        ),
        [{ value: null, colspan: 26 }],
        ...getTableSectionLayout(
          reportData.pm.sum,
          reportData.pm.timeRange,
          '2 HR PM',
        ),
        [{ value: null, colspan: 26 }],
        ...getTableSectionLayout(
          reportData.all.sum,
          reportData.all.timeRange,
          '8 HR SUM',
        ),
      ];
      return { header, body };
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-tmc-summary {
  table {
    width: 1600px;
    & > thead {
      background-color: var(--base-lighter);
      & > tr > th {
        padding: var(--space-xs) var(--space-s);
      }
    }
    & > tbody {
      & > tr {
        &:nth-child(2n) {
          background-color: transparent;
        }
        &:nth-child(6n) {
          height: var(--space-l);
        }
        &:nth-child(12n+7),
        &:nth-child(12n+8),
        &:nth-child(12n+9),
        &:nth-child(12n+10),
        &:nth-child(12n+11) {
          background-color: var(--base-lighter);
        }
      }
    }
  }
}
</style>
