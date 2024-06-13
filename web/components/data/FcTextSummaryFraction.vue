<template>
  <div
    class="display-1"
    :class="{ 'font-weight-medium': !small }">
    {{a}}
    <span
      v-if="showB && a!== b"
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
