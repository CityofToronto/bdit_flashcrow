<template>
<b-col class="pane-display" :cols="cols">
  <section>
    <header>
      <slot name="title"></slot>
    </header>
    <div class="content-wrapper">
      <div class="content">
        <slot name="content"></slot>
      </div>
    </div>
    <footer>
      <b-container fluid>
        <b-row class="pt-2 pb-2">
          <slot name="actionBar"></slot>
        </b-row>
      </b-container>
    </footer>
  </section>
</b-col>
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
  background-color: #fafafa;
  & > section {
    display: flex;
    flex-direction: column;
    height: 100%;
    & > header,
    & > .content-wrapper {
      padding: 0 15px;
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
}
</style>
