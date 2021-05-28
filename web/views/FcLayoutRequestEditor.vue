<template>
  <div class="fc-layout-request-editor fill-height">
    <div class="fc-pane-wrapper d-flex fill-height">
      <div class="fc-drawer flex-grow-1 flex-shrink-0">
        <router-view></router-view>
      </div>
      <div class="flex-grow-1 flex-shrink-0">
        <FcMap
          class="fill-height"
          :layers="{
            collisions: false,
            hospitals: false,
            schools: false,
            studies: true,
            volume: false,
          }"
          :location-active="locationToAdd"
          :locations-state="locationsState">
          <template v-slot:top-left>
            <FcInputLocationSearch
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
        const selected = this.showSelection ? this.indicesSelected.includes(i) : false;
        const state = {
          deselected: false,
          locationIndex,
          multi: this.showLocationIndices,
          selected,
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
    showSelection() {
      return this.$route.name === 'requestStudyNew';
    },
    ...mapState('editRequests', ['indicesSelected']),
    ...mapGetters('editRequests', ['locations']),
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
