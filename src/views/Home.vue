<template>
  <div class="main home">
    <CardMap />
    <CardBottom />
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
};
</script>

<style lang="postcss">
.home {
  display: flex;
  flex-direction: column;
}
</style>
