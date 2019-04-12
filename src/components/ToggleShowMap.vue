<template>
<b-form-checkbox v-model="showMap" name="check-button" switch>
  Show Map
</b-form-checkbox>
</template>

<script>
export default {
  name: 'ToggleShowMap',
  computed: {
    showMap: {
      get() {
        return this.$store.state.showMap;
      },
      set(showMap) {
        this.$store.commit('setShowMap', showMap);
      },
    },
  },
};
</script>

<style lang="postcss">

</style>
