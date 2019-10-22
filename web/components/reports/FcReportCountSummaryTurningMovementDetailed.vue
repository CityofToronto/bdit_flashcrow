<template>
  <section class="fc-report-tmc-detailed">
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
  </section>
</template>

<script>
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcReportTable from
  '@/web/components/reports/FcReportTable.vue';

function getTableHeader() {
  const dirs = [
    { value: 'Left', style: { bl: true } },
    { value: 'Thru' },
    { value: 'Right' },
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
        colspan: 3,
        style: { bl: true },
      },
      {
        value: 'EASTBOUND',
        colspan: 3,
        style: { bl: true },
      },
      {
        value: 'SOUTHBOUND',
        colspan: 3,
        style: { bl: true },
      },
      {
        value: 'WESTBOUND',
        colspan: 3,
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

function getTimeHuman(t) {
  const time = new Date(t.slice(0, -1));
  return TimeFormatters.formatTimeOfDay(time);
}

function getTableSectionLayout({ t, data: sectionData }) {
  const dirs = ['N', 'E', 'S', 'W'];
  const turns = ['L', 'T', 'R'];
  const timeHuman = getTimeHuman(t);
  return [
    [
      {
        value: timeHuman,
        header: true,
        rowspan: 4,
        style: { br: true },
      },
      { value: 'CAR', header: true },
      ...Array.prototype.concat.apply([], dirs.map(dir => [
        ...turns.map(turn => ({
          value: sectionData[`${dir}_CARS_${turn}`],
          style: { bl: turn === 'L' },
        })),
      ])),
      { value: 'N', header: true, style: { bl: true } },
      { value: sectionData.N_PEDS },
      { value: sectionData.N_BIKE },
      { value: sectionData.N_OTHER },
    ],
    [
      { value: 'TRUCK', header: true },
      ...Array.prototype.concat.apply([], dirs.map(dir => [
        ...turns.map(turn => ({
          value: sectionData[`${dir}_TRUCK_${turn}`],
          style: { bl: turn === 'L' },
        })),
      ])),
      { value: 'S', header: true, style: { bl: true } },
      { value: sectionData.S_PEDS },
      { value: sectionData.S_BIKE },
      { value: sectionData.S_OTHER },
    ],
    [
      { value: 'BUS', header: true },
      ...Array.prototype.concat.apply([], dirs.map(dir => [
        ...turns.map(turn => ({
          value: sectionData[`${dir}_BUS_${turn}`],
          style: { bl: turn === 'L' },
        })),
      ])),
      { value: 'E', header: true, style: { bl: true } },
      { value: sectionData.E_PEDS },
      { value: sectionData.E_BIKE },
      { value: sectionData.E_OTHER },
    ],
    [
      { value: null, header: true },
      ...Array.prototype.concat.apply([], dirs.map(() => [
        ...turns.map(turn => ({
          value: null,
          style: { bl: turn === 'L' },
        })),
      ])),
      { value: 'W', header: true, style: { bl: true } },
      { value: sectionData.W_PEDS },
      { value: sectionData.W_BIKE },
      { value: sectionData.W_OTHER },
    ],
  ];
}

export default {
  name: 'FcReportCountSummaryTurningMovementDetailed',
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
      const body = Array.prototype.concat.apply([], reportData.map(getTableSectionLayout));
      return { header, body };
    },
  },
};
</script>

<style lang="postcss">
.fc-report-tmc-detailed {
  table {
    & > tbody {
      & > tr {
        &:nth-child(2n) {
          background-color: transparent;
        }
        &:nth-child(8n+5),
        &:nth-child(8n+6),
        &:nth-child(8n+7),
        &:nth-child(8n+8) {
          background-color: var(--base-lighter);
        }
      }
    }
  }
}
</style>
