<template>
  <transition name="fc-open-down">
    <div
      class="fc-toast flex-container-row font-size-xl full-width"
      :class="'fc-toast-' + variant">
      <i
        class="fa"
        :class="'fa-' + icon"></i>
      <slot></slot>
      <div class="flex-fill"></div>
      <button
        class="tds-button-secondary"
        @click="clearToast">
        <i class="fa fa-times"></i>
      </button>
    </div>
  </transition>
</template>

<script>
import { mapMutations } from 'vuex';

import { VARIANT_ICONS } from '@/web/components/tds/TdsConstants';

export default {
  name: 'FcToast',
  props: {
    variant: {
      type: String,
      default: 'success',
    },
  },
  computed: {
    icon() {
      return VARIANT_ICONS[this.variant];
    },
  },
  methods: {
    ...mapMutations(['clearToast']),
  },
};
</script>

<style lang="postcss">
.fc-toast {
  align-items: center;
  border-style: solid;
  border-width: 1px 0;
  box-shadow: var(--shadow-3);
  padding: var(--space-m) var(--space-xl);
  position: absolute;
  z-index: var(--z-index-toast);
  & > i {
    margin-right: var(--space-m);
  }
  &.fc-toast-success {
    background-color: var(--success-light);
    border-color: var(--success-darker);
    color: var(--success-darker);
  }
  &.fc-toast-warning {
    background-color: var(--warning-light);
    border-color: var(--warning-darker);
    color: var(--warning-darker);
  }
  &.fc-toast-error {
    background-color: var(--error-light);
    border-color: var(--error-darker);
    color: var(--error-darker);
  }
}
</style>
