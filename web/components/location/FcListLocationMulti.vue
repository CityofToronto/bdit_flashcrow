<template>
  <v-list class="fc-list-location-multi">
    <v-list-item
      v-for="(location, i) in locations"
      :key="i"
      :disabled="disabledNormalized[i]">
      <v-list-item-title>
        <div class="d-flex">
          <FcIconLocationMulti
            v-bind="locationsIconProps[i]"
            :class="iconClasses" />
          <div class="body-1 flex-grow-1 flex-shrink-1">
            <div
              :class="{
                'body-1': locationsIconProps[i].locationIndex === -1,
                title: locationsIconProps[i].locationIndex !== -1,
              }">
              {{location.description}}
            </div>
            <slot name="subtitle" v-bind="{ location, i }" />
          </div>
          <v-spacer></v-spacer>
          <div class="flex-grow-0 flex-shrink-0">
            <slot name="action" v-bind="{ location, i }" />
          </div>
        </div>
      </v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script>
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcListLocationMulti',
  components: {
    FcIconLocationMulti,
  },
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
