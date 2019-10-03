<template>
  <div class="toggle-show-map font-size-l">
    <label class="tds-toggle">
      <span v-if="showMap">Hide Map</span>
      <span v-else>Show Map</span>
      <input
        type="checkbox"
        v-model="showMap" />
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
