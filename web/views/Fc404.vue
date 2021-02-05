<template>
  <div class="fc-404 d-flex fill-height flex-column justify-center px-4">
    <section class="text-center">
      <h2 class="display-4 mb-4">Page Not Found</h2>
      <FcButton
        large
        type="primary"
        @click="$router.push({ name: 'home' })">
        <v-icon left>mdi-home</v-icon>
        Go to Home Page
      </FcButton>
    </section>
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'Fc404',
  components: {
    FcButton,
  },
};
</script>

<style lang="scss">
.fc-404 {
  position: relative;
  &::before {
    background-image: url('/404_bg.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    content: "";
    height: 100%;
    left: 0;
    opacity: 0.2;
    position: absolute;
    top: 0;
    width: 100%;
  }
}
</style>
