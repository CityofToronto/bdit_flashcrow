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
    padding-left: 0;
  }
}
</style>
