<template>
  <b-container fluid class="main">
    <b-row class="row-nav-secondary pb-2">
      <slot name="navSecondary"></slot>
    </b-row>
    <b-row class="row-panes" no-gutters>
      <slot name="panes"></slot>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'LayoutMain',
};
</script>

<style lang="postcss">
.main {
  display: flex;
  flex-direction: column;
  height: 100%;
  & > .row-nav-secondary {
    background-color: #fafafa;
  }
  & > .row-panes {
    flex-grow: 1;
    margin-left: -15px;
    margin-right: -15px;
  }
}
</style>
