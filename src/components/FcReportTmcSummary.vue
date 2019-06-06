<template>
  <div class="fc-report-tmc-summary">
    <pre>{{JSON.stringify(countData, null, 2)}}</pre>
  </div>
</template>

<script>
export default {
  name: 'FcReportTmcSummary',
  props: {
    count: Object,
    countData: Array,
  },
};
</script>

<style lang="postcss">
.fc-report-tmc-summary {

}
</style>
