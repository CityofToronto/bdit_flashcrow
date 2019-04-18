<template>
  <main class="layout-main">
    <section class="nav-secondary">
      <slot name="navSecondary"></slot>
    </section>
    <section class="panes">
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
    background-color: #fafafa;
    display: flex;
    flex-direction: row;
    margin-bottom: calc(var(--sp) * 2);
    padding: var(--sp) calc(var(--sp) * 2);
  }
  & > .panes {
    display: flex;
    flex-direction: row;
    flex: 1;
  }
}
</style>
