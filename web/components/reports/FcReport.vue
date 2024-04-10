<template>
  <article class="fc-report">
    <FcReportHeader
      :study-type="studyType"
      :type="type"
      v-bind="header" />
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
          :key="'contentRow_' + i"
          :is="'FcReport' + contentRow.type.suffix"
          v-bind="contentRow.options"
          class="pt-4" />
      </template>
    </div>
  </article>
</template>

<script>
import { ReportType, StudyType } from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';
import FcReportBarChart
  from '@/web/components/reports/FcReportBarChart.vue';
import FcReportHeader
  from '@/web/components/reports/FcReportHeader.vue';
import FcReportInfo
  from '@/web/components/reports/FcReportInfo.vue';
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
    FcReportHeader,
    FcReportInfo,
    FcReportMetadata,
    FcReportPageBreak,
    FcReportTable,
  },
  props: {
    content: Array,
    generatedAt: DateTime,
    header: Object,
    studyType: {
      type: StudyType,
      default: null,
    },
    type: ReportType,
  },
};
</script>
<style lang="scss">
.fc-report {
  margin-left: 25px;
}
</style>
