<template>
  <div class="fc-layout-request-editor fill-height">
    <div class="fc-pane-wrapper d-flex fill-height">
      <div class="fc-drawer flex-grow-1 flex-shrink-0">
        <router-view
          @action-focus-map="actionFocusMap"></router-view>
      </div>
      <div class="flex-grow-1 flex-shrink-0">
        <FcMap
          class="fill-height"
          :location-active="locationToAdd"
          :locations-state="locationsState"
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
            <FcMapPopupActionRequestEditor
              :feature="feature" />
          </template>
        </FcMap>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import FcMap from '@/web/components/geo/map/FcMap.vue';
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
  },
  data() {
    return {
      locationToAdd: null,
    };
  },
  computed: {
    locationsState() {
      return this.locations.map((location, i) => {
        const locationIndex = this.showLocationIndices ? i : -1;
        const deselected = this.showSelection ? !this.indicesSelected.includes(i) : false;
        const state = {
          deselected,
          locationIndex,
          multi: this.showLocationIndices,
          selected: false,
        };
        return { location, state };
      });
    },
    showActionPopup() {
      const { name } = this.$route;
      return name === 'requestStudyNew' || name === 'requestStudyEdit';
    },
    showLocationIndices() {
      return this.$route.name === 'requestStudyNew';
    },
    showLocationSearch() {
      const { name } = this.$route;
      return name === 'requestStudyNew' || name === 'requestStudyEdit';
    },
    showSelection() {
      return this.$route.name === 'requestStudyNew';
    },
    ...mapState('editRequests', ['indicesSelected']),
    ...mapGetters('editRequests', ['locations']),
  },
  methods: {
    actionFocusMap() {
      const $locationSearch = this.$refs.locationSearch.$el;
      focusInput($locationSearch);
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
    width: 50%;
  }

  & > .fc-pane-wrapper > .fc-drawer {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
  }
}

</style>
