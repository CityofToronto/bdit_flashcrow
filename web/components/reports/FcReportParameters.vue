<template>
  <div style="display:flex; justify-content: center;">

    <div class="fc-report-parameters" >
      <h2 class="display-1 mt-4 mb-4" style="font-size:1rem;">Set Parameters</h2>
      <div class="warrant-component">
        <component
        :is="'FcReportParameters' + reportType.suffix"
        v-model="internalReportParameters" />
      </div>
      <div style="justify-self: center;">
        <FcButton
        type="primary"
        @click="onClickSave">Generate Warrant</FcButton>
      </div>
    </div>
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
  width: 100%;
  margin-bottom: 60px;
  margin-left: 60px;
  max-width:450px;
}
.warrant-component {
  border-radius:4px;
  margin-top: 15px;
  margin-bottom: 15px;
  border: 2px solid lightgrey;
  padding-left:25px;
  padding-right:25px;
}
</style>
