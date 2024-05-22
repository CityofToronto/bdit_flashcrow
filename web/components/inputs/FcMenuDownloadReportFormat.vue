<template>
  <v-menu>
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        v-bind="attrs"
        v-on="on"
        class="ml-2"
        :disabled="disabled"
        title="Export Reports"
        color="primary"
        :loading="loading"
        :scope="requireAuth ? [] : null"
        :type="type">
        <span class="fc-download-label">Export</span>
          <span  v-if="textScreenReader !== null" class="sr-only">
            {{textScreenReader}}
          </span>
          <v-icon right>mdi-arrow-top-right</v-icon>
      </FcButton>
    </template>
    <v-list>
      <v-list-item
        v-for="{ label, value } in items"
        :key="value"
        @click="$emit('download-report-format', value)">
        <v-list-item-title>
          {{label}}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { ReportFormat, ReportType } from '@/lib/Constants';
import FcButton from '@/web/components/inputs/FcButton.vue';

const DOWNLOAD_REPORT_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];

export default {
  name: 'FcMenuDownloadReportFormat',
  components: {
    FcButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    reportType: {
      type: ReportType,
      default: null,
    },
    requireAuth: {
      type: Boolean,
      default: false,
    },
    textScreenReader: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: 'primary',
    },
  },
  computed: {
    items() {
      if (this.loading) {
        return [];
      }
      let items = DOWNLOAD_REPORT_FORMATS_SUPPORTED;
      if (this.reportType !== null) {
        items = items.filter(reportFormat => this.reportType.formats.includes(reportFormat));
      }
      return items.map(({ name }) => ({ label: name, value: name }));
    },
  },
};
</script>
<style lang="scss">
.fc-download-label {
  text-transform: none;
}
</style>
