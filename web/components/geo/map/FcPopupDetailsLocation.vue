<template>
  <div>
    <p
      v-for="(line, i) in description"
      :key="i"
      class="body-1 mb-1">
      {{line}}
    </p>
  </div>
</template>

<script>
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';

const MSG_LOCATION_REMOVED = 'Location removed from centreline';

// TODO: DRY with FcPopupDetailsStudy
function getLocationDescription(location, poiSummary) {
  if (location === null) {
    /*
     * Fallback in case this study refers to a location that has been removed from the
     * centreline.
     */
    return MSG_LOCATION_REMOVED;
  }
  const locationFeatureType = getLocationFeatureType(location);
  let trafficSignal = '';
  if (poiSummary.trafficSignal !== null) {
    trafficSignal = ` (PX ${poiSummary.trafficSignal.px})`;
  }

  if (locationFeatureType === null) {
    return `${location.description}${trafficSignal}`;
  }
  return `${locationFeatureType.description} \u00b7 ${location.description}${trafficSignal}`;
}

export default {
  name: 'FcPopupDetailsLocation',
  props: {
    featureDetails: Object,
  },
  computed: {
    description() {
      const { location, poiSummary } = this.featureDetails;
      const description = [];
      if (location !== null) {
        description.push(getLocationDescription(location, poiSummary));
      }
      return description;
    },
  },
};
</script>
