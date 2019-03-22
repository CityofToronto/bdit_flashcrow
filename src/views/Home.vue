<template>
  <div class="main home">
    <CardMap v-if="requestStep === 1" />
    <CardBottom
      :request-step="requestStep"
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
      requestStep: 1,
    };
  },
  methods: {
    setRequestStep(requestStep) {
      this.requestStep = requestStep;
    },
  },
};
</script>

<style lang="postcss">
.home {
  display: flex;
  flex-direction: column;
}
</style>
