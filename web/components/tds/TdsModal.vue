<template>
  <div class="tds-modal-container">
    <div class="tds-modal-backdrop"></div>
    <aside class="tds-modal flex-container-column shadow-2">
      <label class="tds-modal-close" @click="$emit('modal-close')">&times;</label>
      <header>
        <slot name="header"></slot>
      </header>
      <div class="tds-modal-content flex-fill">
        <slot name="content"></slot>
      </div>
      <footer
        v-if="$scopedSlots.footer"
        class="mt-m">
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
  --modal-size-m: 480px;

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
    width: var(--modal-size-m);
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
      border-bottom: var(--border-default);
    }
    & > .tds-modal-content {
      min-height: auto;
    }
    & > footer {
      border-top: var(--border-default);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-top: var(--space-s);
    }
  }
}
</style>
