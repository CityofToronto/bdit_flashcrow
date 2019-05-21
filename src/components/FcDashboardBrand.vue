<template>
<div class="fc-dashboard-brand">
  <i class="far fa-circle"></i>
  <i class="fa fa-bolt"></i>
  <i class="fa fa-crow"></i>
</div>
</template>

<script>
export default {
  name: 'FcDashboardBrand',
};
</script>

<style lang="postcss">
.fc-dashboard-brand {
  height: calc(var(--font-size-xl) + var(--space-m) * 4);
  position: relative;
  & > i {
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    &.fa-circle {
      color: var(--white);
      font-size: calc(var(--font-size-xl) * 1.5);
      opacity: var(--opacity-75);
    }
    &.fa-bolt {
      color: var(--warning);
      font-size: calc(var(--font-size-xl) * 1.5);
    }
    &.fa-crow {
      color: var(--ink);
      font-size: var(--font-size-xl);
    }
  }
}
</style>
