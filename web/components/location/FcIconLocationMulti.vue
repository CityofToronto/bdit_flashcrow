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
      const suffixSelected = this.selected ? '-selected' : '';
      if (this.locationIndex === -1) {
        const suffixMidblock = this.midblock ? '-midblock' : '';
        return `/icons/map/location-multi-corridor${suffixMidblock}${suffixSelected}.svg`;
      }
      return `/icons/map/location-multi-small${suffixSelected}.svg`;
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
