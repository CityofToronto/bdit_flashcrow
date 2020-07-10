<template>
  <div
    class="fc-icon-location-multi">
    <img :src="src" :alt="alt" />
    <div
      class="subtitle-2"
      :class="{
        'primary--text': selected,
        'white--text': !selected,
      }">{{locationIndex + 1}}</div>
  </div>
</template>

<script>
export default {
  name: 'FcIconLocationMulti',
  props: {
    locationIndex: {
      type: Number,
      default: null,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    alt() {
      const i = this.locationIndex + 1;
      return `Location #${i}`;
    },
    src() {
      if (this.selected) {
        return '/icons/map/location-multi-small-selected.svg';
      }
      return '/icons/map/location-multi-small.svg';
    },
  },
};
</script>

<style lang="scss">
.fc-icon-location-multi {
  position: relative;
  & > div {
    left: 4.5px;
    position: absolute;
    top: 1.5px;
  }
}
</style>
