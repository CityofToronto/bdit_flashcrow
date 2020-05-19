<template>
  <section class="fc-report">
    <header class="fc-report-header align-center d-flex">
      <div>
        <img
          alt="City of Toronto"
          src="/cot_logo.png"
          width="175" />
      </div>
      <div class="ml-3">
        <div class="title">{{ORG_NAME}}</div>
        <div class="display-1">{{type.label}}</div>
      </div>
    </header>
    <div>
      <component
        v-for="({ type: blockType, options }, i) in content"
        :key="'block_' + i"
        :is="'FcReport' + blockType.suffix"
        v-bind="options"
        class="pt-4" />
    </div>
  </section>
</template>

<script>
import { ORG_NAME, ReportType } from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';
import FcReportBarChart
  from '@/web/components/reports/FcReportBarChart.vue';
import FcReportMetadata
  from '@/web/components/reports/FcReportMetadata.vue';
import FcReportTable
  from '@/web/components/reports/FcReportTable.vue';

export default {
  name: 'FcReport',
  components: {
    FcReportBarChart,
    FcReportMetadata,
    FcReportTable,
  },
  props: {
    type: ReportType,
    date: DateTime,
    content: Array,
  },
  data() {
    return {
      ORG_NAME,
    };
  },
};
</script>

<style lang="scss">
.fc-report {
  & > .fc-report-header {
    color: var(--v-primary-base);
  }
}
</style>
