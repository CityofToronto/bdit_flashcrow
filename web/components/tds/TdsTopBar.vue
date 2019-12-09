<template>
<div class="tds-top-bar flex-container-row">
  <slot name="left"></slot>
  <div class="flex-fill"></div>
  <slot name="right"></slot>
</div>
</template>

<script>
export default {
  name: 'TdsTopBar',
};
</script>

<style lang="postcss">
.tds-top-bar {
  align-items: center;
  padding: var(--space-m) var(--space-l);
  & > * {
    margin-right: var(--space-m);
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
