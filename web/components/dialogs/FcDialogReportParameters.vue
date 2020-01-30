<template>
  <v-dialog
    v-model="internalValue"
    max-width="300"
    scrollable>
    <v-card>
      <v-card-title>Set Parameters</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <component
          :is="'FcReportParameters' + reportType.suffix"
          v-model="internalReportParameters"
          @update-report="$emit('update-report')" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="internalValue = false">Cancel</v-btn>
        <v-btn
          color="primary"
          text
          @click="onClickSave">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ReportType } from '@/lib/Constants';
import FcReportParametersWarrantTrafficSignalControl
  from '@/web/components/reports/FcReportParametersWarrantTrafficSignalControl.vue';

export default {
  name: 'FcDialogReportParameters',
  components: {
    FcReportParametersWarrantTrafficSignalControl,
  },
  props: {
    reportParameters: Object,
    reportType: ReportType,
    value: Boolean,
  },
  data() {
    const internalReportParameters = JSON.parse(JSON.stringify(this.reportParameters));
    return {
      internalReportParameters,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    onClickSave() {
      this.$emit('set-report-parameters', this.internalReportParameters);
      this.internalValue = false;
    },
  },
};
</script>
