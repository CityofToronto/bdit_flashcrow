<template>
  <div
    class="fc-icon-location-multi">
    <img :src="src" :alt="alt" />
    <div
      v-if="locationIndex !== -1"
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
      default: -1,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    alt() {
      if (this.locationIndex === -1) {
        return 'Included intersection between locations';
      }
      const i = this.locationIndex + 1;
      return `Location #${i}`;
    },
    src() {
      if (this.locationIndex === -1) {
        if (this.selected) {
          return '/icons/map/location-multi-corridor-selected.svg';
        }
        return '/icons/map/location-multi-corridor.svg';
      }
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
