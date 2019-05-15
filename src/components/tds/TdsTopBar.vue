<template>
<div class="tds-top-bar">
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
  background-color: var(--base-lighter);
  display: flex;
  flex-direction: row;
  padding: var(--space-m) var(--space-xl);
  & > * {
    margin-right: var(--space-m);
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
