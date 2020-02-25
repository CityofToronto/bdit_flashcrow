<template>
  <v-dialog
    v-model="internalValue"
    max-width="300"
    scrollable>
    <v-card role="dialog">
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
        <FcButton
          type="tertiary"
          @click="internalValue = false">Cancel</FcButton>
        <FcButton
          type="tertiary"
          @click="onClickSave">Save</FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ReportType } from '@/lib/Constants';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcReportParametersWarrantTrafficSignalControl
  from '@/web/components/reports/FcReportParametersWarrantTrafficSignalControl.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogReportParameters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcReportParametersWarrantTrafficSignalControl,
  },
  props: {
    reportParameters: Object,
    reportType: ReportType,
  },
  data() {
    const internalReportParameters = JSON.parse(JSON.stringify(this.reportParameters));
    return {
      internalReportParameters,
    };
  },
  methods: {
    onClickSave() {
      this.$emit('set-report-parameters', this.internalReportParameters);
      this.internalValue = false;
    },
  },
};
</script>
