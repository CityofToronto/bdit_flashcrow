<template>
  <div class="fc-report-parameters">
    <h2 class="display-1 mt-4">Set Parameters</h2>
    <div class="d-flex mt-2 mb-6">
      <FcButton
        class="ml-2"
        type="primary"
        @click="onClickSave">Generate Warrant</FcButton>
    </div>
    <component
      :is="'FcReportParameters' + reportType.suffix"
      v-model="internalReportParameters" />
  </div>
</template>

<script>
import { ReportType } from '@/lib/Constants';
import { reviver } from '@/lib/JsonUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcReportParametersWarrantTrafficSignalControl
  from '@/web/components/reports/FcReportParametersWarrantTrafficSignalControl.vue';

export default {
  name: 'FcReportParameters',
  components: {
    FcButton,
    FcReportParametersWarrantTrafficSignalControl,
  },
  props: {
    reportParameters: Object,
    reportType: ReportType,
  },
  data() {
    const internalReportParameters = JSON.parse(
      JSON.stringify(this.reportParameters),
      reviver,
    );

    return {
      internalReportParameters,
    };
  },
  methods: {
    onClickSave() {
      this.$emit('set-report-parameters', this.internalReportParameters);
    },
  },
};
</script>

<style lang="scss">
.fc-report-parameters {
  margin: 0 auto;
  width: 240px;
}
</style>
