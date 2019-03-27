<template>
  <div class="main home">
    <CardMap
      :highlight-marker="highlightMarker"
      :location-query="locationQuery"
      :request-step="requestStep"
      v-on:set-location-query="setLocationQuery"
      v-on:set-request-step="setRequestStep" />
    <CardBottom
      :location-query="locationQuery"
      :request-step="requestStep"
      v-on:set-location-query="setLocationQuery"
      v-on:set-highlight-marker="setHighlightMarker"
      v-on:set-request-step="setRequestStep" />
  </div>
</template>

<script>
import CardBottom from '@/components/CardBottom.vue';
import CardMap from '@/components/CardMap.vue';

export default {
  name: 'Home',
  components: {
    CardBottom,
    CardMap,
  },
  data() {
    return {
      highlightMarker: false,
      locationQuery: '',
      requestStep: 1,
    };
  },
  methods: {
    setHighlightMarker(highlightMarker) {
      this.highlightMarker = highlightMarker;
    },
    setLocationQuery(locationQuery) {
      this.locationQuery = locationQuery;
    },
    setRequestStep(requestStep) {
      this.requestStep = requestStep;
    },
  },
};
</script>

<style lang="postcss">
</style>
