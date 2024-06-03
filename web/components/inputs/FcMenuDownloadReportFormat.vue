<template>
  <v-menu>
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        v-bind="attrs"
        v-on="on"
        :disabled="disabled"
        width="55px"
        max-width="55px"
        min-width="55px"
        title="Export Reports"
        :loading="loading"
        height="25px"
        color="primary"
        class="fc-download-button"
        :scope="requireAuth ? [] : null"
        :type="type">
          <span  v-if="textScreenReader !== null" class="sr-only">
            {{textScreenReader}}
          </span>
          <v-icon>mdi-cloud-download</v-icon>
          <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list shaped>
      <v-subheader>Export Formats:</v-subheader>
      <v-list-item
        v-for="{ label, value } in items"
        :key="value"
        @click="$emit('download-report-format', value)">
        <v-list-item-title>
          <v-icon color="primary">mdi-download</v-icon>
          Zipped {{label}} files
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
.fc-download-button {
  opacity: 0.8;
  margin-top: 5px;
}
</style>
