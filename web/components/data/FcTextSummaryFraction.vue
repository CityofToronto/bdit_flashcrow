<template>
  <div :class="small ? 'display-1' : 'display-2'">
    {{a}}
    <span
      v-if="showB"
      class="body-1 secondary--text">
      / {{b}}
    </span>
  </div>
</template>

<script>
export default {
  name: 'FcTextSummaryFraction',
  props: {
    a: Number,
    b: Number,
    showB: Boolean,
    small: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
