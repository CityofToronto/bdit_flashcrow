<template>
  <section class="pane-display">
    <header>
      <slot name="title"></slot>
    </header>
    <div class="content">
      <slot name="content"></slot>
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
  & > .content {
    padding: 0 var(--space-xl);
  }
  & > .content {
    flex: 1;
    overflow: auto;
  }
  & > footer {
    display: flex;
    flex-direction: row;
    font-size: var(--font-size-xl);
    padding: var(--space-m) var(--space-xl);
  }
}
</style>
