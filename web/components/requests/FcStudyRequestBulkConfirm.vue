<template>
  <section class="pl-5 py-5">
    <v-expansion-panels
      accordion
      flat
      focusable>
      <v-expansion-panel class="fc-study-request-bulk-confirm-locations">
        <v-expansion-panel-header>
          <span class="body-1">Intersections</span>
          <v-spacer></v-spacer>
          <span class="display-1 flex-grow-0 flex-shrink-0 mr-5">
            {{indicesIntersectionsSelected.length}}
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="shading pt-1">
          <template
            v-for="(i, j) in indicesIntersectionsSelected">
            <v-divider
              :key="'divider_' + j"
              v-if="j > 0" />
            <div
              :key="i"
              class="align-center d-flex">
              <FcCardStudyRequestConfirm
                class="flex-grow-1 flex-shrink-1 mr-5 my-2 shading"
                :icon-props="locationsIconProps[i]"
                :location="locations[i]"
                :study-request="studyRequests[i]" />
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <FcButton
                    aria-label="Remove Study from Request"
                    class="mr-4"
                    type="icon"
                    @click="$emit('remove-study', i)"
                    v-on="on">
                    <v-icon>mdi-close</v-icon>
                  </FcButton>
                </template>
                <span>Remove Study from Request</span>
              </v-tooltip>
            </div>
          </template>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel class="fc-study-request-bulk-confirm-locations">
        <v-expansion-panel-header>
          <span class="body-1">Midblocks</span>
          <v-spacer></v-spacer>
          <span class="display-1 flex-grow-0 flex-shrink-0 mr-5">
            {{indicesMidblocksSelected.length}}
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="shading pt-1">
          <template
            v-for="(i, j) in indicesMidblocksSelected">
            <v-divider
              :key="'divider_' + j"
              v-if="j > 0" />
            <div
              :key="i"
              class="align-center d-flex">
              <FcCardStudyRequestConfirm
                class="flex-grow-1 flex-shrink-1 mr-5 my-2 shading"
                :icon-props="locationsIconProps[i]"
                :location="locations[i]"
                :study-request="studyRequests[i]" />
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <FcButton
                    aria-label="Remove Study from Request"
                    class="mr-4"
                    type="icon"
                    @click="$emit('remove-study', i)"
                    v-on="on">
                    <v-icon>mdi-close</v-icon>
                  </FcButton>
                </template>
                <span>Remove Study from Request</span>
              </v-tooltip>
            </div>
          </template>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <FcSummaryStudyRequest
      :study-request="studyRequestBulk" />
  </section>
</template>

<script>
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcCardStudyRequestConfirm from '@/web/components/requests/FcCardStudyRequestConfirm.vue';
import FcSummaryStudyRequest from '@/web/components/requests/summary/FcSummaryStudyRequest.vue';

export default {
  name: 'FcStudyRequestBulkConfirm',
  components: {
    FcButton,
    FcCardStudyRequestConfirm,
    FcSummaryStudyRequest,
  },
  props: {
    indicesIntersectionsSelected: Array,
    indicesMidblocksSelected: Array,
    locations: Array,
    locationsSelection: Object,
    studyRequestBulk: Object,
    studyRequests: Array,
  },
  computed: {
    locationsIconProps() {
      return getLocationsIconProps(this.locations, this.locationsSelection.locations);
    },
  },
};
</script>

<style lang="scss">
.fc-study-request-bulk-confirm-locations {
  border-bottom: 1px solid var(--v-border-base);

  & .v-expansion-panel-content__wrap {
    padding-right: 0;
  }
}
</style>
