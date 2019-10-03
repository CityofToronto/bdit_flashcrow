<template>
  <span
    class="tds-label"
    :class="'tds-label-' + variant">
    <i
      class="fa"
      :class="'fa-' + variantIcon"></i>
    <slot></slot>
  </span>
</template>

<script>
import { VARIANT_ICONS } from '@/web/components/tds/TdsConstants';

export default {
  name: 'TdsLabel',
  props: {
    icon: {
      type: String,
      default: null,
    },
    variant: {
      type: String,
      default: 'info',
    },
  },
  computed: {
    variantIcon() {
      return this.icon || VARIANT_ICONS[this.variant];
    },
  },
};
</script>
