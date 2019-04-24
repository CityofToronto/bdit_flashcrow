<template>
  <aside class="modal">
    <label class="modal-close" for="modal_toggle">&times;</label>
    <header>
      <slot name="header"></slot>
    </header>
    <div class="modal-content">
      <slot name="content"></slot>
    </div>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </aside>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    data: {
      type: Object,
      default() { return {}; },
    },
  },
};
</script>

<style lang="postcss">
.modal {
  display: flex;
  flex-direction: column;
  position: relative;
  & > .modal-close {
    color: var(--outline-grey);
    cursor: pointer;
    font-size: var(--text-xxl);
    font-weight: var(--font-bold);
    height: 30px;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
    width: 30px;
    &:hover {
      color: var(--outline-grey-focus);
    }
  }
  & > header {
    border-bottom: 1px solid var(--outline-grey);
  }
  & > .modal-content {
    flex: 1;
    min-height: 120px;
  }
  & > footer {
    border-top: 1px solid var(--outline-grey);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-top: var(--sp);
  }
}
</style>
