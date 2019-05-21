<template>
  <main class="layout-main flex-fill">
    <section class="nav-secondary">
      <slot name="navSecondary"></slot>
    </section>
    <section class="panes flex-fill">
      <slot name="panes"></slot>
    </section>
  </main>
</template>

<script>
export default {
  name: 'LayoutMain',
};
</script>

<style lang="postcss">
.layout-main {
  display: flex;
  flex-direction: column;
  & > .nav-secondary {
    align-items: center;
    background-color: var(--base-lightest);
    display: flex;
    flex-direction: row;
    margin-bottom: var(--space-m);
    padding: var(--space-l) var(--space-xl);
  }
  & > .panes {
    display: flex;
    flex-direction: row;
  }
}
</style>
