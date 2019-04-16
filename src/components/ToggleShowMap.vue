<template>
  <div class="form-group form-group-toggle">
    <label for="cb1">Show Map</label>
    <input id="cb1" type="checkbox" v-model="showMap" />
  </div>
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
/* see https://codepen.io/mallendeo/pen/eLIiG */
.form-group-toggle {

}
</style>
