<template>
  <div class="fc-report-warrant-traffic-signal-control-section mb-l">
    <FcReportTable v-bind="tableLayout" />
  </div>
</template>

<script>
import FcReportTable from
  '@/web/components/reports/FcReportTable.vue';

export default {
  name: 'FcReportWarrantTrafficSignalControlSection',
  components: {
    FcReportTable,
  },
  props: {
    caption: {
      type: String,
      default: null,
    },
    sectionData: Object,
    title: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      COMPLIANCE_FULL: 100,
      COMPLIANCE_PARTIAL: 80,
    };
  },
  computed: {
    tableLayout() {
      /* eslint-disable prefer-destructuring */
      const caption = this.caption;
      const sectionData = this.sectionData;
      const title = this.title;
      const COMPLIANCE_FULL = this.COMPLIANCE_FULL;
      const COMPLIANCE_PARTIAL = this.COMPLIANCE_PARTIAL;
      return {
        title,
        caption,
        header: [
          [
            {
              value: null,
              style: { br: true },
            },
            ...sectionData.hourly.map((_, i) => ({
              value: `Hour ${i + 1}`,
            })),
            {
              value: 'Total',
              style: { bl: true },
            },
          ],
        ],
        body: [
          [
            {
              value: 'Value',
              header: true,
              style: { br: true },
            },
            ...sectionData.hourly.map(({ value }) => ({
              value,
            })),
            {
              value: null,
              style: { bl: true },
            },
          ],
          [
            {
              value: `${COMPLIANCE_FULL}% fulfilled (${sectionData.threshold.full})`,
              header: true,
              style: { br: true },
            },
            ...sectionData.hourly.map(({ compliance }) => ({
              value: compliance === COMPLIANCE_FULL ? true : null,
            })),
            {
              value: sectionData.compliance.full,
              style: { bl: true },
            },
          ],
          [
            {
              value: `${COMPLIANCE_PARTIAL}% fulfilled (${sectionData.threshold.partial})`,
              header: true,
              style: { br: true },
            },
            ...sectionData.hourly.map(({ compliance }) => ({
              value: compliance === COMPLIANCE_PARTIAL ? true : null,
            })),
            {
              value: sectionData.compliance.partial,
              style: { bl: true },
            },
          ],
          [
            {
              value: 'Actual % (if <80%)',
              header: true,
              style: { br: true },
            },
            ...sectionData.hourly.map(({ compliance }) => ({
              value: compliance < COMPLIANCE_PARTIAL ? compliance : null,
            })),
            {
              value: sectionData.compliance.rest,
              style: { bl: true },
            },
          ],
        ],
        footer: [
          [
            {
              value: 'Total',
              header: true,
              style: { bb: true, bt: true },
            },
            {
              value: null,
              colspan: sectionData.hourly.length,
              style: { bb: true, bt: true },
            },
            {
              value: sectionData.compliance.total,
              style: { bb: true, bt: true },
            },
          ],
          [
            {
              value: 'Section %',
              header: true,
            },
            {
              value: null,
              colspan: sectionData.hourly.length,
            },
            {
              value: sectionData.compliance.avg,
              style: { bold: true, fontSize: 'l' },
            },
          ],
        ],
      };
    },
  },
};
</script>
