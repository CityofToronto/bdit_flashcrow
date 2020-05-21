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
      <template v-for="(contentRow, i) in content">
        <v-row
          v-if="Array.isArray(contentRow)"
          :key="'content_' + i">
          <v-col
            v-for="({ type: blockType, options }, j) in contentRow"
            :key="'content_' + i + '_' + j">
            <component
              :is="'FcReport' + blockType.suffix"
              v-bind="options"
              class="pt-4" />
          </v-col>
        </v-row>
        <component
          v-else
          :key="'content_' + i"
          :is="'FcReport' + contentRow.type.suffix"
          v-bind="contentRow.options"
          class="pt-4" />
      </template>
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
import FcReportPageBreak
  from '@/web/components/reports/FcReportPageBreak.vue';
import FcReportTable
  from '@/web/components/reports/FcReportTable.vue';

export default {
  name: 'FcReport',
  components: {
    FcReportBarChart,
    FcReportMetadata,
    FcReportPageBreak,
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
