<template>
  <div style="display:flex; justify-content: center;">

    <div class="fc-report-parameters" >
     <span v-if="this.cautionList.includes(centrelineId)"
  style="display: flex; align-items: center;">
  <h2 class="display-1 mt-4 mb-4" style="font-size:1rem;">Set Parameters</h2>
  <v-tooltip right>
    <template #activator="{ on, attrs }">
      <v-icon
        v-bind="attrs"
        v-on="on"
        color="error"
        small
        class="ml-1"
        style="vertical-align: middle;">
        mdi-alert-circle
      </v-icon>
    </template>
    <span>Studies at this location may be skewed by the geometry of the roads.
          We recommend downloading the raw data for this study and
          running the warrant manually.</span>
  </v-tooltip>
  <span style="color: #C62828;
  font-size: 0.75rem; font-weight: 600; margin-left: 4px;">Caution</span>
</span>
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
import { getCautionCaseCentrelineIds } from '../../../lib/api/WebApi';

export default {
  name: 'FcReportParameters',
  components: {
    FcButton,
    FcReportParametersWarrantTrafficSignalControl,
  },
  props: {
    reportParameters: Object,
    reportType: ReportType,
    centrelineId: Number,
  },
  data() {
    const internalReportParameters = JSON.parse(
      JSON.stringify(this.reportParameters),
      reviver,
    );

    return {
      internalReportParameters,
      cautionList: [],
    };
  },
  async created() {
    await this.getCautionList();
  },
  methods: {
    async getCautionList() {
      const cautionList = await getCautionCaseCentrelineIds();
      this.cautionList = cautionList;
    },
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
