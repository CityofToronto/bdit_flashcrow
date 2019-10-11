<template>
  <div class="fc-report-warrant-traffic-signal-control-section mb-l">
    <table class="my-m">
      <caption class="font-size-l my-m text-left">
        {{title}}
      </caption>
      <thead>
        <tr>
          <th class="br">&nbsp;</th>
          <th
            v-for="(_, i) in sectionData.hourly"
            :key="'th_' + i">
            Hour {{i + 1}}
          </th>
          <th class="bl">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th class="br">Value</th>
          <td
            v-for="({ value }, i) in sectionData.hourly"
            :key="'value_' + i">
            {{value}}
          </td>
          <td class="bl">&nbsp;</td>
        </tr>
        <tr>
          <th class="br">
            {{COMPLIANCE_FULL}}% fulfilled ({{sectionData.threshold.full}})
          </th>
          <td
            v-for="({ compliance }, i) in sectionData.hourly"
            :key="'compliance_full_' + i">
            <i
              v-if="compliance === COMPLIANCE_FULL"
              class="fa fa-check"></i>
          </td>
          <td class="bl">{{sectionData.compliance.full}}</td>
        </tr>
        <tr>
          <th class="br">
            {{COMPLIANCE_PARTIAL}}% fulfilled ({{sectionData.threshold.partial}})
          </th>
          <td
            v-for="({ compliance }, i) in sectionData.hourly"
            :key="'compliance_partial_' + i">
            <i
              v-if="compliance === COMPLIANCE_PARTIAL"
              class="fa fa-check"></i>
          </td>
          <td class="bl">{{sectionData.compliance.partial}}</td>
        </tr>
        <tr>
          <th class="br">Actual % (if &lt;80%)</th>
          <td
            v-for="({ compliance }, i) in sectionData.hourly"
            :key="'compliance_rest_' + i">
            <span v-if="compliance < COMPLIANCE_PARTIAL">
              {{compliance}}
            </span>
          </td>
          <td class="bl">{{sectionData.compliance.rest}}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th class="bb bt">
            Total
          </th>
          <td
            class="bb bt"
            :colspan="sectionData.hourly.length">
            &nbsp;
          </td>
          <td class="bb bt">{{sectionData.compliance.total}}</td>
        </tr>
        <tr>
          <th>
            Section %
          </th>
          <td :colspan="sectionData.hourly.length">
          </td>
          <td class="font-size-l">
            <strong>{{sectionData.compliance.avg}}</strong>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script>
export default {
  name: 'FcReportWarrantTrafficSignalControlSection',
  props: {
    sectionData: Object,
    title: String,
  },
  data() {
    return {
      COMPLIANCE_FULL: 100,
      COMPLIANCE_PARTIAL: 80,
    };
  },
};
</script>
