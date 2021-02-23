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
    zIndex: {
      type: Number,
      default: 100,
    },
  },
};
</script>
