<template>
  <div class="fc-report-atr-volume-24h-graph">
    <pre>{{JSON.stringify(countData, null, 2)}}</pre>
  </div>
</template>

<script>
export default {
  name: 'FcReportAtrVolume24hGraph',
  props: {
    count: Object,
    countData: Array,
  },
};
</script>

<style lang="postcss">
.fc-report-atr-volume-24h-graph {

}
</style>
