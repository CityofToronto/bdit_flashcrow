<template>
  <section class="min-height-fill py-1">
    <div
      v-for="i in indices"
      :key="i"
      class="align-center d-flex">
      <v-tooltip right>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-checkbox
              v-model="internalValue"
              :aria-label="'Include ' + locations[i].description + ' in request'"
              class="mx-5"
              :value="i" />
          </div>
        </template>
        <span>Include {{locations[i].description}} in request</span>
      </v-tooltip>
      <FcCardStudyRequest
        class="flex-grow-1 flex-shrink-1 mr-5 my-1"
        :icon-props="locationsIconProps[i]"
        :location="locations[i]"
        :most-recent-by-study-type="mostRecentByLocationAndStudyType[i]"
        :selected="internalValue.includes(i)"
        :study-request="studyRequests[i]"
        :v="v.$each[i]" />
    </div>
  </section>
</template>

<script>
import { StudyType } from '@/lib/Constants';
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
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
    studySummaryPerLocationUnfiltered: Array,
    v: Object,
  },
  computed: {
    locationsIconProps() {
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
    mostRecentByLocationAndStudyType() {
      return this.locations.map((_, i) => {
        const mostRecentByStudyType = new Map(
          StudyType.enumValues.map(studyType => [studyType, null]),
        );
        this.studySummaryPerLocationUnfiltered.forEach(({ category, perLocation }) => {
          const { studyType } = category;
          const { mostRecent } = perLocation[i];
          mostRecentByStudyType.set(studyType, mostRecent);
        });
        return mostRecentByStudyType;
      });
    },
  },
};
</script>
