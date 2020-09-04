<template>
  <section class="min-height-fill shading py-2">
    <div
      v-for="i in indices"
      :key="i"
      class="align-center d-flex">
      <v-checkbox
        v-model="internalValue"
        class="mx-5"
        :value="i" />
      <FcCardStudyRequest
        class="flex-grow-1 flex-shrink-1 mr-5 my-2"
        :icon-props="locationsIconProps[i]"
        :location="locations[i]"
        :selected="internalValue.includes(i)"
        :study="study"
        :study-request="studyRequests[i]" />
    </div>
  </section>
</template>

<script>
import { StudyHours } from '@/lib/Constants';
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import DateTime from '@/lib/time/DateTime';
import FcCardStudyRequest from '@/web/components/requests/FcCardStudyRequest.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkLocations',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcCardStudyRequest,
  },
  props: {
    indices: Array,
    locations: Array,
    locationsSelection: Object,
    studyRequests: Array,
  },
  data() {
    return {
      // TODO: get actual study info
      study: {
        duration: null,
        hours: StudyHours.ROUTINE,
        startDate: DateTime.local(),
      },
    };
  },
  computed: {
    locationsIconProps() {
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
  },
};
</script>
