<template>
<b-col class="pane-display" :cols="cols">
  <h2>Display Pane</h2>
  <router-link :to="{name: 'home'}">ViewExplore</router-link>
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
  background-color: #fff;
}
</style>
