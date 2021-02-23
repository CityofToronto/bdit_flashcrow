<template>
  <FcTooltip
    :bottom="bottom"
    :left="left"
    :right="right"
    :top="top">
    <template v-slot:activator="{ on }">
      <FcButton
        :aria-label="ariaLabel"
        :class="buttonClass"
        :type="type"
        v-bind="$attrs"
        v-on="{
          ...on,
          ...$listeners
        }">
        <slot></slot>
      </FcButton>
    </template>
    <span>{{ariaLabel}}</span>
  </FcTooltip>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcButtonAria',
  components: {
    FcButton,
    FcTooltip,
  },
  props: {
    ariaLabel: String,
    bottom: {
      type: Boolean,
      default: false,
    },
    buttonClass: {
      type: [Array, Object, String],
      default: null,
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
    type: String,
  },
};
</script>
