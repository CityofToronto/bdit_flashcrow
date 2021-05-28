<template>
  <div
    aria-label="Search for a location in the map"
    class="fc-selector-single-location"
    role="search">
    <FcInputLocationSearch
      ref="autofocus"
      v-model="internalValue"
      class="elevation-2" />
  </div>
</template>

<script>
import { LocationSelectionType } from '@/lib/Constants';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';

function fromInternalValue(internalValue) {
  const locations = [];
  if (internalValue !== null) {
    locations.push(internalValue);
  }
  return {
    locations,
    selectionType: LocationSelectionType.POINTS,
  };
}

function toInternalValue(value) {
  const { locations } = value;
  const [location = null] = locations;
  return location;
}

export default {
  name: 'FcSelectorSingleLocation',
  mixins: [FcMixinInputAutofocus],
  components: {
    FcInputLocationSearch,
  },
  props: {
    value: Object,
  },
  computed: {
    internalValue: {
      get() {
        return toInternalValue(this.value);
      },
      set(internalValue) {
        const value = fromInternalValue(internalValue);
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style lang="scss">
.fc-selector-single-location {
  & > .fc-input-location-search {
    width: 448px;
  }
}
</style>
