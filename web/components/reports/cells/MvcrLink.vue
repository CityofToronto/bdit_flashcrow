<template>
  <button v-on:click="view">view</button>
</template>

<script>

export default {
  name: 'MvcrLink',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    view() {
      return true;
    },
  },
};
</script>

<style>

</style>
