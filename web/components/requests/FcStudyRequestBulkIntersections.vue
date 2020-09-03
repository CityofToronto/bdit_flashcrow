<template>
  <section class="min-height-fill shading py-2">
    <div
      v-for="i in intersectionIndices"
      :key="i"
      class="align-center d-flex">
      <v-checkbox
        v-model="intersectionsSelected"
        class="mx-5"
        :value="i" />
      <v-card
        class="fc-study-request-bulk-intersection flex-grow-1 flex-shrink-1 mr-5 my-2"
        :class="{
          selected: intersectionsSelected.includes(i),
        }"
        flat>
        <v-card-title class="align-start">
          <FcIconLocationMulti
            class="mr-5"
            v-bind="locationsIconProps[i]" />
          <div>
            <div>{{locations[i].description}}</div>
            <FcTextMostRecent
              class="font-weight-regular"
              :study="study" />
          </div>
        </v-card-title>
      </v-card>
    </div>
  </section>
</template>

<script>
import { StudyHours } from '@/lib/Constants';
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import DateTime from '@/lib/time/DateTime';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkIntersections',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcIconLocationMulti,
    FcTextMostRecent,
  },
  props: {
    intersectionIndices: Array,
    locations: Array,
    locationsSelection: Object,
  },
  data() {
    return {
      intersectionsSelected: [...this.intersectionIndices],
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

<style lang="scss">
.fc-study-request-bulk-intersection.theme--light.v-sheet {
  border: 1px solid var(--v-border-base);
  &.selected {
    border: 2px solid var(--v-primary-base);
  }
}
</style>
