<template>
  <v-list class="fc-list-location-dropdown">
    <v-list-item
      v-for="(location, i) in locations"
      :key="i"
      :disabled="disabledNormalized[i]"
      @click="$emit('click-location', i)">
      <v-list-item-title class="px-0 fc-list-dropdown-row">
        <span class="px-4">
          <img v-if="location.centrelineType == 1" title="Midblock"
          src="/icons/map/location-multi-midblock.svg" alt="Midblock icon"
          width="14" :class="{'fc-icon-dim':disabledNormalized[i]}"/>
          <img v-else title="Intersection"
          src="/icons/map/location-multi-intersection.svg" alt="Midblock icon"
          width="14" :class="{'fc-icon-dim':disabledNormalized[i]}"/>
        </span>
        <div class="d-flex align-center truncate">
          <div class="fc-list-dropdown-text truncate">
            <div class="truncate" :class="{
                'fc-location-hidden': locationsIconProps[i].locationIndex === -1,
                'fc-location-normal': locationsIconProps[i].locationIndex !== -1,
              }">
              {{location.description}}
            </div>
          </div>
        </div>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script>
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';

export default {
  name: 'FcListLocationMulti',
  components: {},
  props: {
    disabled: {
      type: Array,
      default: null,
    },
    iconClasses: {
      type: String,
      default: null,
    },
    locations: Array,
    locationsSelection: Object,
  },
  computed: {
    disabledNormalized() {
      if (this.disabled === null) {
        return this.locations.map(() => false);
      }
      return this.disabled;
    },
    locationsIconProps() {
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
  },
};
</script>

<style lang="scss">
.fc-list-location-dropdown {
  min-width: 300px;
  & .truncate {
    white-space: normal;
    max-width: 300px;
  }
  & .fc-list-dropdown-row {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    font-size: 12px
  }
  & .fc-list-dropdown-text {
    max-width: 250px;
  }
  & .v-list-item {
    padding: 0;
  }
  & .fc-icon-dim {
    opacity: 0.6;
  }
}
</style>
