<template>
  <section class="pl-5 py-5">
    <v-expansion-panels
      accordion
      flat
      focusable>
      <v-expansion-panel
        ref="autofocus"
        class="fc-study-request-bulk-confirm-locations">
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
              <FcButtonAria
                :aria-label="'Remove ' + locations[i].description + ' from Request'"
                class="mr-4"
                right
                type="icon"
                @click="$emit('remove-study', i)">
                <v-icon>mdi-close</v-icon>
              </FcButtonAria>
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
              <FcButtonAria
                :aria-label="'Remove ' + locations[i].description + ' from Request'"
                class="mr-4"
                right
                type="icon"
                @click="$emit('remove-study', i)">
                <v-icon>mdi-close</v-icon>
              </FcButtonAria>
            </div>
          </template>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="mr-5 mt-4">
      <FcSummaryStudyRequest
        :is-create="true"
        :study-request="studyRequestBulk" />
    </div>
  </section>
</template>

<script>
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcCardStudyRequestConfirm from '@/web/components/requests/FcCardStudyRequestConfirm.vue';
import FcSummaryStudyRequest from '@/web/components/requests/summary/FcSummaryStudyRequest.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';

export default {
  name: 'FcStudyRequestBulkConfirm',
  mixins: [FcMixinInputAutofocus],
  components: {
    FcButtonAria,
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
