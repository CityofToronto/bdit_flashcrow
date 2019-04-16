<template>
  <section class="pane-display">
    <header>
      <slot name="title"></slot>
    </header>
    <div class="content-wrapper">
      <div class="content">
        <slot name="content"></slot>
      </div>
    </div>
    <footer>
      <slot name="actionBar"></slot>
    </footer>
  </section>
</template>

<script>
export default {
  name: 'PaneDisplay',
  props: {
    cols: Number,
  },
};
</script>

<style lang="postcss">
.pane-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  & > header,
  & > .content-wrapper {
    padding: 0 calc(var(--sp) * 2);
  }
  & > .content-wrapper {
    flex-grow: 1;
    & > .content {
      height: 100%;
      overflow: auto;
    }
  }
  & > footer {
    background-color: var(--outline-grey);
    border-top: 1px solid var(--outline-grey-focus);
    display: flex;
    flex-direction: row;
    font-size: var(--text-xl);
    padding: calc(var(--sp) * 2);
  }
}
</style>
