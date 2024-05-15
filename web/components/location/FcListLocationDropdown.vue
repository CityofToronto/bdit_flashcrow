<template>
  <v-list class="fc-list-location-dropdown">
    <v-list-item
      v-for="(location, i) in locations"
      :key="i"
      :disabled="disabledNormalized[i]"
      @click="$emit('click-location', i)">
      <v-list-item-title class="px-0 fc-list-dropdown-row">
        <v-icon
          :class="{'fc-icon-dim':disabledNormalized[i]}"
          class="pa-2" size="20">
          mdi-map-marker
        </v-icon>
        <div class="d-flex align-center truncate">
          <div class="fc-list-dropdown-text body-1 truncate">
            <div class="truncate" :class="{
                'body-1': locationsIconProps[i].locationIndex === -1,
                title: locationsIconProps[i].locationIndex !== -1,
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
  & .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  & .fc-list-dropdown-row {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }
  & .fc-list-dropdown-text {
    max-width: 180px;
  }
  & .v-list-item {
    padding: 0;
  }
  & .fc-icon-dim {
    opacity: 0.6;
  }
}
</style>
