<template>
  <div class="main run-warrant">
    <CardMap />
    <CardWarrant />
  </div>
</template>

<script>
import CardMap from '@/components/CardMap.vue';
import CardWarrant from '@/components/CardWarrant.vue';

export default {
  name: 'RunWarrant',
  components: {
    CardMap,
    CardWarrant,
  },
};
</script>

<style lang="postcss">
.run-warrant {
  display: flex;
  flex-direction: column;
}
</style>
