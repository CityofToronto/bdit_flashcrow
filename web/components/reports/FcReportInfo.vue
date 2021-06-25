<template>
  <div>
    <span class="font-weight-regular secondary--text subtitle-2">
      {{text}}
    </span>
  </div>
</template>

<script>
export default {
  name: 'FcReportInfo',
  props: {
    text: String,
  },
};
</script>
