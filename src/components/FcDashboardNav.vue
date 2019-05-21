<template>
<nav class="fc-dashboard-nav">
  <ul>
    <slot></slot>
  </ul>
</nav>
</template>

<script>
export default {
  name: 'FcDashboardNav',
};
</script>

<style lang="postcss">
.fc-dashboard-nav {
  margin-top: var(--space-l);
  & > ul {
    list-style: none;
    margin-block-start: 0;
    margin-block-end: 0;
    padding-inline-start: 0;
  }
}
</style>
