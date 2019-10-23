<template>
  <div class="fc-report-atr-detailed">
    <header class="py-m">
      <div>
        <strong>{{count.locationDesc}}</strong>
      </div>
      <div>
        <strong>Category: </strong>
        <span>{{count.type.label}}</span>
      </div>
    </header>
    <footer>
      <FcReportTable v-bind="tableLayout" />
    </footer>
  </div>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import FcReportTable from '@/web/components/reports/FcReportTable.vue';

export default {
  name: 'FcReportCountSummary24hDetailed',
  components: {
    FcReportTable,
  },
  props: {
    count: Object,
    reportData: Array,
  },
  computed: {
    tableLayout() {
      /* eslint-disable prefer-destructuring */
      // TODO: handle flexible bucket sizes
      const reportData = this.reportData;

      return {
        columnStyles: [
          { c: 0, style: { width: '3xl' } },
        ],
        header: [
          [
            { value: 'Start Hour', style: { br: true } },
            { value: ':00', style: { br: true } },
            { value: ':15', style: { br: true } },
            { value: ':30', style: { br: true } },
            { value: ':45' },
          ],
        ],
        body: ArrayUtils.range(24).map((h) => {
          const i = h * 4;
          return [
            { value: h, header: true, style: { br: true } },
            { value: reportData[i].count, style: { br: true } },
            { value: reportData[i + 1].count, style: { br: true } },
            { value: reportData[i + 2].count, style: { br: true } },
            { value: reportData[i + 3].count },
          ];
        }),
      };
    },
  },
};
</script>
