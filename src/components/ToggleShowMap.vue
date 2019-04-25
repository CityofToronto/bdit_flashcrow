<template>
  <div class="toggle-show-map form-group size-lg">
    <label>Show Map
      <input type="checkbox" v-model="showMap" />
    </label>
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
.toggle-show-map {
  flex: 1;
  text-align: right;
}
</style>
