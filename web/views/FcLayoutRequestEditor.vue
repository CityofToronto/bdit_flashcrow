<template>
  <div class="fc-layout-request-editor fill-height">
    <div class="fc-pane-wrapper d-flex fill-height">
      <div class="fc-drawer flex-shrink-0">
        <router-view
          @action-focus-map="actionFocusMap"></router-view>
      </div>
      <div class="flex-shrink-0 map">
        <FcMap
          class="fill-height"
          :layers="{
            collisions: false,
            hospitals: false,
            schools: false,
            studies: true,
            volume: false,
          }"
          :hover-layer-state="hoveredStudyIndex"
          :location-active="locationToAdd"
          :locations-state="mapMarkers"
          :easeToLocationMode="mapEaseMode"
          :show-legend="false">
          <template v-slot:top-left>
            <FcInputLocationSearch
              ref="locationSearch"
              v-if="showLocationSearch"
              v-model="locationToAdd"
              class="elevation-2 mt-3 ml-5" />
          </template>

          <template
            v-if="showActionPopup"
            v-slot:action-popup="feature">
            <v-divider></v-divider>

            <v-card-actions class="shading">
              <FcMapPopupActionRequestEditor v-if="isNewRequest" :feature="feature" />
              <EditStudyLocationPopUpVue v-else :feature="feature" />
            </v-card-actions>
          </template>
        </FcMap>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import FcMap from '@/web/components/geo/map/FcMap.vue';
import EditStudyLocationPopUpVue
  from '@/web/components/geo/map/EditStudyLocationPopUp.vue';
import FcMapPopupActionRequestEditor
  from '@/web/components/geo/map/FcMapPopupActionRequestEditor.vue';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';
import { focusInput } from '@/web/ui/FormUtils';

export default {
  name: 'FcLayoutRequestEditor',
  components: {
    FcInputLocationSearch,
    FcMap,
    FcMapPopupActionRequestEditor,
    EditStudyLocationPopUpVue,
  },
  data() {
    return {
      locationToAdd: null,
      mapEaseMode: 'all',
      searchLocationMarkerOpts: {
        multi: true,
        locationIndex: false,
        selected: false,
        deselected: false,
      },
    };
  },
  computed: {
    mapMarkers() {
      const mapMarkers = [...this.studyRequestMarkers];
      if (this.isSearchActive) {
        const searchMarker = {
          location: this.locationToAdd,
          state: this.searchLocationMarkerOpts,
        };
        mapMarkers.push(searchMarker);
      }
      return mapMarkers;
    },
    studyRequestMarkers() {
      const studyRequestMarkers = this.locations.map((location, i) => {
        const locationIndex = this.isNewRequest ? i : -1;
        const selected = this.showSelection ? this.indicesSelected.includes(i) : false;
        const state = {
          deselected: false,
          locationIndex,
          multi: this.isNewRequest,
          selected,
        };
        return { location, state };
      });
      return studyRequestMarkers;
    },
    showActionPopup() {
      if (this.indicesSelected.length > 1) {
        return false;
      }
      const { name } = this.$route;
      return name === 'requestStudyNew' || name === 'requestStudyEdit';
    },
    isNewRequest() {
      return this.$route.name === 'requestStudyNew';
    },
    showLocationSearch() {
      const { name } = this.$route;
      return name === 'requestStudyNew' || name === 'requestStudyEdit';
    },
    showSelection() {
      return this.$route.name === 'requestStudyNew';
    },
    isSearchActive() {
      return this.locationToAdd !== null;
    },
    ...mapState('editRequests', ['indicesSelected', 'hoveredStudyIndex']),
    ...mapGetters('editRequests', ['locations', 'hoverLocation']),
  },
  methods: {
    actionFocusMap() {
      const $locationSearch = this.$refs.locationSearch.$el;
      focusInput($locationSearch);
    },
    clearSearch() {
      this.locationToAdd = null;
    },
  },
  watch: {
    locationToAdd(newLocation) {
      if (newLocation !== null) {
        this.mapEaseMode = 'single';
      }
    },
    locations(newLocations, prevLocations) {
      const nNewLocations = newLocations.length;
      const nPrevLocations = prevLocations.length;
      if (nPrevLocations !== 0 && nNewLocations > nPrevLocations) {
        this.mapEaseMode = 'none';
      }
      if (this.isSearchActive) this.clearSearch();
    },
  },
};
</script>

<style lang="scss">
.fc-layout-request-editor {
  width: 100%;

  & .fc-input-location-search {
    width: 448px;
  }

  & > .fc-pane-wrapper > div {
    flex-basis: 0;
  }

  & > .fc-pane-wrapper > .fc-drawer {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
    flex-grow: 2;
  }

  & > .fc-pane-wrapper > .map {
    flex-grow: 1;
  }
}
.fc-layout-request-editor .fc-map-top-left .fc-input-location-search {
  width: 348px;
}
</style>
