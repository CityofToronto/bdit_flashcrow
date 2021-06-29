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
import TimeFormatters from '@/lib/time/TimeFormatters';

const MSG_LOCATION_REMOVED = 'Location removed from centreline';

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
  name: 'FcPopupDetailsStudy',
  props: {
    featureDetails: Object,
  },
  computed: {
    description() {
      const { location, poiSummary, studySummary } = this.featureDetails;
      const description = [];

      studySummary.forEach(({ mostRecent, studyType }) => {
        const { beta, label } = studyType;
        const { startDate } = mostRecent;
        let studyTypeStr = label;
        if (beta !== null) {
          studyTypeStr = `${studyTypeStr} (Beta)`;
        }
        const startDateStr = TimeFormatters.formatDefault(startDate);
        const dayOfWeek = TimeFormatters.formatDayOfWeek(startDate);
        const studyStr = `${studyTypeStr}: ${startDateStr} (${dayOfWeek})`;
        description.push(studyStr);
      });

      const locationStr = getLocationDescription(location, poiSummary);
      description.push(locationStr);

      return description;
    },
  },
};
</script>
