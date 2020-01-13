<template>
  <div
    class="tds-panel"
    :class="'tds-panel-' + variant">
    <v-icon>mdi-{{variantIcon}}</v-icon>
    <slot></slot>
  </div>
</template>

<script>
import { VARIANT_ICONS } from '@/web/components/tds/TdsConstants';

export default {
  name: 'TdsPanel',
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
