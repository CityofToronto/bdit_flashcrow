<template>
  <div
    class="fc-icon-location-single">
    <img
      height="30"
      :src="src"
      :width="24" />
  </div>
</template>

<script>
export default {
  name: 'FcIconLocationSingle',
  computed: {
    src() {
      return '/icons/map/location-single.svg';
    },
  },
};
</script>

<style lang="scss">
.fc-icon-location-single {
  position: relative;
  & > div {
    left: 4.5px;
    position: absolute;
    top: 4.5px;
    width: 15px;
    white-space: nowrap;
    text-align: center;
  }
}
</style>
