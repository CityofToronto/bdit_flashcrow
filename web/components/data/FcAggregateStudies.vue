<template>
  <div class="fc-aggregate-studies mb-5 mx-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <h3>TODO: aggregate studies</h3>
    </template>
  </div>
</template>

<script>
export default {
  name: 'FcAggregateStudies',
  props: {
    loading: Boolean,
    studySummaryPerLocation: Array,
    studySummaryPerLocationUnfiltered: Array,
  },
};
</script>
