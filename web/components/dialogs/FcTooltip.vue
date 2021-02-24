<template>
  <v-tooltip
    :bottom="bottom"
    :left="left"
    :right="right"
    :top="top"
    :z-index="zIndex">
    <template v-slot:activator="scope">
      <slot name="activator" v-bind="scope" />
    </template>
    <slot />
  </v-tooltip>
</template>

<script>
export default {
  name: 'FcTooltip',
  props: {
    bottom: {
      type: Boolean,
      default: false,
    },
    left: {
      type: Boolean,
      default: false,
    },
    right: {
      type: Boolean,
      default: false,
    },
    top: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /*
       * This is carefully chosen to be higher than `var(--z-index-controls)`, so that tooltips
       * will display on top of map controls.
       */
      zIndex: 100,
    };
  },
  mounted() {
    const inDialog = this.$el.closest('.v-dialog') !== null;
    if (inDialog) {
      /*
       * Bring this above the z-plane of the dialog, so that it displays properly.  (When we last
       * checked, `.v-dialog` had `z-index: 202`.)
       */
      this.zIndex = 300;
    }
  },
};
</script>
