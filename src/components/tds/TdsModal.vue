<template>
  <div class="tds-modal-container">
    <div class="tds-modal-backdrop"></div>
    <aside class="tds-modal shadow-2">
      <label class="tds-modal-close" @click="$emit('modal-close')">&times;</label>
      <header>
        <slot name="header"></slot>
      </header>
      <div class="tds-modal-content">
        <slot name="content"></slot>
      </div>
      <footer>
        <slot name="footer"></slot>
      </footer>
    </aside>
  </div>
</template>

<script>
export default {
  name: 'TdsModal',
  props: {
    data: {
      type: Object,
      default() { return {}; },
    },
  },
};
</script>

<style lang="postcss">
.tds-modal-container {
  position: relative;
  .tds-modal-backdrop {
    background-color: var(--modal-backdrop);
    height: 100vh;
    left: 0;
    opacity: 1;
    position: fixed;
    top: 0;
    transition: opacity var(--transition-short);
    visibility: visible;
    width: 100vw;
    z-index: var(--z-index-modal-backdrop);
  }
  .tds-modal {
    background-color: var(--base-lightest);
    display: flex;
    flex-direction: column;
    height: auto;
    left: 50%;
    max-height: 100%;
    max-width: 100%;
    opacity: 1;
    padding: var(--space-m);
    pointer-events: auto;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    visibility: visible;
    width: 400px;
    z-index: var(--z-index-modal-content);
    & > .tds-modal-close {
      color: var(--base);
      cursor: pointer;
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      height: 30px;
      position: absolute;
      right: 0;
      text-align: center;
      top: 0;
      width: 30px;
      &:hover {
        color: var(--base-darkest);
      }
    }
    & > header {
      border-bottom: 1px solid var(--base);
    }
    & > .tds-modal-content {
      flex: 1;
      min-height: 120px;
    }
    & > footer {
      border-top: 1px solid var(--base);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-top: var(--space-s);
    }
  }
}
</style>
