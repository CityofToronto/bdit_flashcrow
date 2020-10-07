<template>
  <div
    class="fc-icon-location-multi">
    <img
      :alt="alt"
      height="20"
      :src="src"
      :width="16" />
    <div
      v-if="locationIndex !== -1"
      aria-hidden="true"
      class="subtitle-2"
      :class="textClass">{{locationIndex + 1}}</div>
  </div>
</template>

<script>
export default {
  name: 'FcIconLocationMulti',
  props: {
    deselected: {
      type: Boolean,
      default: false,
    },
    locationIndex: {
      type: Number,
      default: -1,
    },
    midblock: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    alt() {
      if (this.locationIndex === -1) {
        if (this.midblock) {
          return 'Included midblock between locations';
        }
        return 'Included intersection between locations';
      }
      const i = this.locationIndex + 1;
      return `Location #${i}`;
    },
    src() {
      const { suffixState, suffixType } = this;
      return `/icons/map/location-multi${suffixType}${suffixState}.svg`;
    },
    suffixState() {
      if (this.deselected) {
        return '-deselected';
      }
      if (this.selected) {
        return '-selected';
      }
      return '';
    },
    suffixType() {
      if (this.locationIndex === -1) {
        if (this.midblock) {
          return '-midblock';
        }
        return '-intersection';
      }
      return '-small';
    },
    textClass() {
      if (this.locationIndex === -1) {
        return null;
      }
      if (this.deselected) {
        return 'secondary--text';
      }
      if (this.selected) {
        return 'primary--text';
      }
      return 'white--text';
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
