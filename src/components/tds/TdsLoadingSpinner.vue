<template>
  <div class="tds-loading-spinner"></div>
</template>

<script>
export default {

};
</script>

<style lang="postcss">
.tds-loading-spinner {
  display: inline-block;
  width: 100%;
  height: 100%;
  &:after {
    content: " ";
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: var(--space-s) solid var(--base-dark);
    border-color: var(--base-dark) transparent var(--base-dark) transparent;
    animation: tds-loading-spinner 1.2s linear infinite;
  }
}

@keyframes tds-loading-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
