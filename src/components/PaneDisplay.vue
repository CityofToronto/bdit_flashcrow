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
      overflow: auto;
    }
  }
  & > footer {
    background-color: #ddd;
    border-top: 1px solid #ccc;
  }
}
</style>
