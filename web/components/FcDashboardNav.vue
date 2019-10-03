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
  & > ul {
    list-style: none;
    margin: 0;
    padding-left: 0;
  }
}
</style>
