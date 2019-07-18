<template>
<div class="fc-dashboard-brand">
  <img
    alt="MOVE"
    class="py-s"
    src="/logo.png" />
</div>
</template>

<script>
export default {
  name: 'FcDashboardBrand',
};
</script>

<style lang="postcss">
.fc-dashboard-brand {
  padding: var(--space-m);
  padding-bottom: var(--space-s);
  position: relative;
  & > img {
    width: 100%;
  }
}
</style>
