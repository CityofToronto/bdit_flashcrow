<template>
  <section class="fc-report">
    <header class="fc-report-header flex-container-row">
      <div class="flex-1">
        <img src="/cot_logo.png" alt="City of Toronto" />
      </div>
      <div class="flex-1 text-center">
        <h2>{{ORG_NAME}}</h2>
        <h3>{{type.label}}</h3>
      </div>
      <div class="flex-1">&nbsp;</div>
    </header>
    <div class="fc-report-content">
      <component
        v-for="({ type: blockType, options }, i) in content"
        :key="'block_' + i"
        :is="'FcReport' + blockType.suffix"
        v-bind="options"
        class="my-m" />
    </div>
  </section>
</template>

<script>
import { ReportType } from '@/lib/Constants';
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
    date: Date,
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
    img {
      height: var(--space-2xl);
    }
    h2,
    h3 {
      color: var(--primary-dark);
    }
  }
}
</style>
