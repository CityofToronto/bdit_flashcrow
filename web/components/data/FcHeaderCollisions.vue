<template>
  <header class="pa-5">
    <div class="align-center d-flex">
      <h3 class="headline">
        <span>Collisions</span>
        <span class="body-1 secondary--text">
          &#x2022; {{collisionTotal}} total
        </span>
      </h3>
      <v-spacer></v-spacer>
      <slot name="action" />
    </div>
  </header>
</template>

<script>
export default {
  name: 'FcHeaderCollisions',
  props: {
    collisionTotal: Number,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
