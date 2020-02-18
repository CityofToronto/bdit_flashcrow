<template>
  <section class="fc-report">
    <header class="fc-report-header align-bottom d-flex">
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
import { ReportType } from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';
import FcReportBarChart
  from '@/web/components/reports/FcReportBarChart.vue';
import FcReportCountMetadata
  from '@/web/components/reports/FcReportCountMetadata.vue';
import FcReportTable
  from '@/web/components/reports/FcReportTable.vue';

export default {
  name: 'FcReport',
  components: {
    FcReportBarChart,
    FcReportCountMetadata,
    FcReportTable,
  },
  props: {
    type: ReportType,
    date: DateTime,
    content: Array,
  },
  data() {
    return {
      ORG_NAME: 'Traffic Safety Unit',
    };
  },
};
</script>

<style lang="postcss">
.fc-report {
  & > .fc-report-header {
    border-bottom: 1px solid var(--primary-dark);
    color: var(--primary-dark);
  }
}
</style>
