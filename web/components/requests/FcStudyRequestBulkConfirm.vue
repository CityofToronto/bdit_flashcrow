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

    <v-row
      class="mt-5"
      no-gutters>
      <v-col class="py-2" cols="6">
        <div class="subtitle-1">
          Study Name
        </div>
        <div class="mt-1 display-1">
          {{studyRequestBulk.name}}
        </div>
      </v-col>
      <v-col class="py-2" cols="6">
        <div class="subtitle-1">
          Due Date
        </div>
        <div class="mt-1 display-1">
          {{studyRequestBulk.dueDate | date}}
        </div>
      </v-col>
    </v-row>

    <v-row
      class="mt-5"
      no-gutters>
      <v-col class="py-2" cols="6">
        <div class="subtitle-1">
          Service Request Number
        </div>
        <div class="mt-1 display-1">
          9950602
        </div>
      </v-col>
      <v-col class="py-2" cols="6">
        <div class="subtitle-1">
          Reason
        </div>
        <div class="mt-1 display-1">
          {{studyRequestBulk.reason.text}}
        </div>
      </v-col>
    </v-row>

    <v-row
      class="mt-5"
      no-gutters>
      <v-col class="py-2" cols="12">
        <div class="subtitle-1">
          Additional Information
        </div>
        <div class="mt-1 display-1">
          <span v-if="studyRequestBulk.urgentReason">{{studyRequestBulk.urgentReason}}</span>
          <span v-else>None</span>
        </div>
      </v-col>
    </v-row>
  </section>
</template>

<script>
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcCardStudyRequestConfirm from '@/web/components/requests/FcCardStudyRequestConfirm.vue';

export default {
  name: 'FcStudyRequestBulkConfirm',
  components: {
    FcButton,
    FcCardStudyRequestConfirm,
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
