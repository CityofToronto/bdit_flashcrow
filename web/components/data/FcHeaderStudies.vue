<template>
  <header class="px-5 py-3">
    <div class="align-center d-flex flex-wrap justify-end">
      <h3 class="headline">
        <span>Studies</span>
        <span class="body-1 secondary--text">
          &#x2022; {{studyTotal}} total
        </span>
      </h3>
      <v-spacer></v-spacer>
      <slot name="action" />
    </div>
  </header>
</template>

<script>
export default {
  name: 'FcHeaderStudies',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    studyTotal: Number,
  },
};
</script>
