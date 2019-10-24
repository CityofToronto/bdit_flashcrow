<template>
  <div class="fc-report-atr-count-summary">
    <header class="py-m">
      <div>
        <strong>{{count.locationDesc}}</strong>
      </div>
      <div>
        <strong>Category: </strong>
        <span>{{count.type.label}}</span>
      </div>
    </header>
    <FcReportTable
      v-for="(tableSectionLayout, i) in tableSectionLayouts"
      :key="'section_' + i"
      v-bind="tableSectionLayout" />
  </div>
</template>

<script>
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcReportTable from '@/web/components/reports/FcReportTable.vue';

function getSectionHeader(sectionTitle) {
  return [
    [
      {
        value: sectionTitle,
        style: { br: true, fontSize: 'xl' },
      },
      { value: 'Station Code' },
      { value: 'Artery Code' },
      { value: 'Category' },
      { value: 'Count Date', style: { br: true } },
      { value: 'AM Peak' },
      { value: 'AM Peak Hour', style: { br: true } },
      { value: 'PM Peak' },
      { value: 'PM Peak Hour', style: { br: true } },
      { value: 'Off Peak' },
      { value: 'Off Peak Hour', style: { br: true } },
      { value: '24 Hour Total' },
    ],
  ];
}

function getSectionFooter(sectionTitle, {
  sum: {
    amPeak,
    pmPeak,
    offPeak,
    total,
  },
}) {
  return [
    [
      { value: null, colspan: 3, style: { bt: true } },
      {
        value: `${sectionTitle} Total:`,
        colspan: 2,
        header: true,
        style: { bt: true },
      },
      { value: amPeak, style: { bt: true } },
      { value: null, style: { bt: true } },
      { value: pmPeak, style: { bt: true } },
      { value: null, style: { bt: true } },
      { value: offPeak, style: { bt: true } },
      { value: null, style: { bt: true } },
      { value: total, style: { bt: true } },
    ],
  ];
}

function getTimeRangeHuman(timeRange) {
  let { start, end } = timeRange;
  start = new Date(start.slice(0, -1));
  end = new Date(end.slice(0, -1));
  return TimeFormatters.formatRangeTimeOfDay({ start, end });
}

function getCountRow({
  location,
  stationCode,
  arteryCode,
  category,
  date: dateStr,
  dayOfWeek,
  amPeak: {
    sum: amPeakCount,
    timeRange: amPeakTimeRange,
  },
  pmPeak: {
    sum: pmPeakCount,
    timeRange: pmPeakTimeRange,
  },
  offPeak: {
    sum: offPeakCount,
    timeRange: offPeakTimeRange,
  },
  total,
}) {
  const date = new Date(dateStr.slice(0, -1));
  const dateHuman = TimeFormatters.formatDefault(date);
  const countDateHuman = `${dateHuman} (${dayOfWeek})`;
  const amPeakTimeRangeHuman = getTimeRangeHuman(amPeakTimeRange);
  const pmPeakTimeRangeHuman = getTimeRangeHuman(pmPeakTimeRange);
  const offPeakTimeRangeHuman = getTimeRangeHuman(offPeakTimeRange);
  return [
    { value: location, style: { br: true } },
    { value: stationCode },
    { value: arteryCode },
    { value: category },
    { value: countDateHuman, style: { br: true } },
    { value: amPeakCount },
    { value: amPeakTimeRangeHuman, style: { br: true } },
    { value: pmPeakCount },
    { value: pmPeakTimeRangeHuman, style: { br: true } },
    { value: offPeakCount },
    { value: offPeakTimeRangeHuman, style: { br: true } },
    { value: total },
  ];
}

function getDirectionGroupRows({
  title: directionGroupTitle,
  counts,
  totals: {
    sum: {
      amPeak: sumAmPeak,
      pmPeak: sumPmPeak,
      offPeak: sumOffPeak,
      total: sumTotal,
    },
    avg: {
      amPeak: avgAmPeak,
      pmPeak: avgPmPeak,
      offPeak: avgOffPeak,
      total: avgTotal,
    },
  },
}) {
  const headerRow = [
    {
      value: directionGroupTitle,
      header: true,
      style: { br: true, fontSize: 'l' },
    },
    { value: null, colspan: 4, style: { br: true } },
    { value: null, colspan: 2, style: { br: true } },
    { value: null, colspan: 2, style: { br: true } },
    { value: null, colspan: 2, style: { br: true } },
    { value: null },
  ];
  const footerRows = [
    [
      { value: null, colspan: 3, style: { bt: true } },
      {
        value: `${directionGroupTitle} Total:`,
        colspan: 2,
        header: true,
        style: { bt: true },
      },
      { value: sumAmPeak, style: { bt: true } },
      { value: null, style: { bt: true } },
      { value: sumPmPeak, style: { bt: true } },
      { value: null, style: { bt: true } },
      { value: sumOffPeak, style: { bt: true } },
      { value: null, style: { bt: true } },
      { value: sumTotal, style: { bt: true } },
    ],
    [
      { value: null },
      { value: null, colspan: 2 },
      { value: `${directionGroupTitle} Average:`, colspan: 2, header: true },
      { value: avgAmPeak },
      { value: null },
      { value: avgPmPeak },
      { value: null },
      { value: avgOffPeak },
      { value: null },
      { value: avgTotal },
    ],
  ];
  return [
    headerRow,
    ...counts.map(getCountRow),
    ...footerRows,
  ];
}

function getSectionLayout({
  title: sectionTitle,
  directionGroups,
  totals,
}) {
  const header = getSectionHeader(sectionTitle);
  const body = Array.prototype.concat.apply(
    [],
    directionGroups.map(getDirectionGroupRows),
  );
  const footer = getSectionFooter(sectionTitle, totals);
  return { header, body, footer };
}

export default {
  name: 'FcReportCountSummary24h',
  components: {
    FcReportTable,
  },
  props: {
    count: Object,
    reportData: Array,
  },
  computed: {
    tableSectionLayouts() {
      return this.reportData.map(getSectionLayout);
    },
  },
};
</script>

<style lang="postcss">
.fc-report-atr-count-summary {
  table {
    width: 1280px;
  }
}
</style>
