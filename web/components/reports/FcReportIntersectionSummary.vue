<template>
  <div class="fc-report-intersection-warrant-summary">
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
  </div>
</template>
[
<script>
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcReportTable from
  '@/web/components/reports/FcReportTable.vue';

function getTimeRangeHuman(timeRange) {
  let { start, end } = timeRange;
  start = new Date(start.slice(0, -1));
  end = new Date(end.slice(0, -1));
  return TimeFormatters.formatRangeTimeOfDay({ start, end });
}

export default {
  name: 'FcReportIntersectionSummary',
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
      const dirs = ['N', 'E', 'S', 'W'];
      const turns = ['L', 'T', 'R'];
      return {
        header: [
          [
            { value: 'Time Period', rowspan: 2, style: { br: true } },
            { value: 'NORTHBOUND', colspan: 3, style: { br: true } },
            { value: 'EASTBOUND', colspan: 3, style: { br: true } },
            { value: 'SOUTHBOUND', colspan: 3, style: { br: true } },
            { value: 'WESTBOUND', colspan: 3, style: { br: true } },
            { value: 'BICYCLES', colspan: 4, style: { br: true } },
            { value: 'OTHER', colspan: 4, style: { br: true } },
            { value: 'MAJOR CROSSINGS', colspan: 2, style: { br: true } },
            { value: 'APPROACHES', colspan: 2, style: { br: true } },
            { value: 'TOTAL', rowspan: 2 },
          ],
          [
            ...Array.prototype.concat.apply([], dirs.map(() => [
              { value: 'Left' },
              { value: 'Thru' },
              { value: 'Right', style: { br: true } },
            ])),
            ...dirs.map(dir => ({ value: dir, style: { br: dir === 'W' } })),
            ...dirs.map(dir => ({ value: dir, style: { br: dir === 'W' } })),
            { value: 'Peds' },
            { value: 'All', style: { br: true } },
            { value: 'Major' },
            { value: 'Minor', style: { br: true } },
          ],
        ],
        body: [
          ...reportData.hourlyTotals.map((hourTotals, hour) => {
            const timeRange = reportData.timeRanges[hour];
            const timeRangeHuman = getTimeRangeHuman(timeRange);
            return [
              { value: timeRangeHuman, header: true, style: { br: true } },
              ...Array.prototype.concat.apply([], dirs.map(
                dir => turns.map(turn => ({
                  value: hourTotals[`${dir}_${turn}`],
                  style: { br: turn === 'R' },
                })),
              )),
              ...dirs.map(dir => ({
                value: hourTotals[`${dir}_BIKE`],
                style: { br: dir === 'W' },
              })),
              ...dirs.map(dir => ({
                value: hourTotals[`${dir}_OTHER`],
                style: { br: dir === 'W' },
              })),
              { value: hourTotals.MAJOR_CROSSING_PEDS },
              { value: hourTotals.MAJOR_CROSSING_TOTAL, style: { br: true } },
              { value: hourTotals.MAJOR_APPROACHES },
              { value: hourTotals.MINOR_APPROACHES, style: { br: true } },
              { value: hourTotals.TOTAL },
            ];
          }),
          [
            { value: '8 Hour Total', header: true, style: { br: true, bt: true } },
            ...Array.prototype.concat.apply([], dirs.map(
              dir => turns.map(turn => ({
                value: reportData.totals[`${dir}_${turn}`],
                style: { br: turn === 'R', bt: true },
              })),
            )),
            ...dirs.map(dir => ({
              value: reportData.totals[`${dir}_BIKE`],
              style: { br: dir === 'W', bt: true },
            })),
            ...dirs.map(dir => ({
              value: reportData.totals[`${dir}_OTHER`],
              style: { br: dir === 'W', bt: true },
            })),
            { value: reportData.totals.MAJOR_CROSSING_PEDS, style: { bt: true } },
            { value: reportData.totals.MAJOR_CROSSING_TOTAL, style: { br: true, bt: true } },
            { value: reportData.totals.MAJOR_APPROACHES, style: { bt: true } },
            { value: reportData.totals.MINOR_APPROACHES, style: { br: true, bt: true } },
            { value: reportData.totals.TOTAL, style: { bt: true } },
          ],
        ],
      };
    },
    timeRanges() {
      return this.reportData.timeRanges.map((timeRange) => {
        let { start, end } = timeRange;
        start = new Date(start.slice(0, -1));
        end = new Date(end.slice(0, -1));
        return { start, end };
      });
    },
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
