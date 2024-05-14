<template>
  <v-list class="fc-list-location-multi">
    <v-list-item
      v-for="(location, i) in locations"
      :key="i"
      :disabled="disabledNormalized[i]">
      <v-list-item-title class="px-0 fc-list-multi-row">
        <v-icon
          :class="{'fc-icon-dim':disabledNormalized[i]}"
          class="fc-location-list-icon pa-1" size="18">
          mdi-map-marker
        </v-icon>
        <div class="d-flex align-center">
          <div class="fc-list-multi-text body-1 truncate">
            <div class="truncate"
              :class="{
                'body-1': locationsIconProps[i].locationIndex === -1,
                title: locationsIconProps[i].locationIndex !== -1,
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
  & .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  & .fc-list-multi-row {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }
  & .fc-list-multi-text {
    max-width: 145px;
    min-width: 145px;
  }
  & .v-list-item {
    padding: 0;
  }
}

@media only screen and (max-width: 750px) {
  .fc-location-list-icon {
    display: none !important;
  }
}
</style>
