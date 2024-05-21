<template>
  <v-list class="fc-list-location-multi">
    <v-list-item
      v-for="(location, i) in locations"
      :key="i"
      :disabled="disabledNormalized[i]">
      <v-list-item-title class="pl-0 pr-1 fc-list-multi-row">
        <v-icon
          :class="{'fc-icon-dim':disabledNormalized[i]}"
          class="fc-location-list-icon pr-2" size="18">
          mdi-map-marker
        </v-icon>
        <div class="d-flex align-center">
          <div class="fc-list-multi-text">
            <div class="fc-list-wrap"
              :class="{
                'fc-location-hidden': locationsIconProps[i].locationIndex === -1,
                'fc-location-normal': locationsIconProps[i].locationIndex !== -1,
              }">
              {{location.description}}
            </div>
            <slot name="subtitle" class="truncate" v-bind="{ location, i }" />
          </div>
        </div>
        <slot name="action" v-bind="{ location, i }" />
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
.fc-list-location-multi {
  & .fc-list-multi-row {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    margin-bottom: 15px;
    margin-left: -10px; // couldn't style veutify wrapper
    margin-right: -10px;
  }
  & .fc-list-multi-text {
    max-width: 200px;
    min-width: 200px;
  }
  & .fc-list-wrap {
    max-width: 200px;
    min-width: 200px;
    white-space: normal;
    font-size: 12px;
  }
  & .v-list-item {
    padding: 0;
  }
  & .fc-icon-dim {
    opacity: 0.6;
  }
}

@media only screen and (max-width: 750px) {
  .fc-location-list-icon {
    display: none !important;
  }
}
</style>
