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
          :locations-state="locationsState" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import FcMap from '@/web/components/geo/map/FcMap.vue';

export default {
  name: 'FcLayoutRequestEditor',
  components: {
    FcMap,
  },
  computed: {
    locationsState() {
      return this.locations.map((location, i) => {
        const selected = this.indicesSelected.includes(i);
        const state = {
          deselected: false,
          locationIndex: i,
          multi: true,
          selected,
        };
        return { location, state };
      });
    },
    ...mapState('editRequests', ['indicesSelected']),
    ...mapGetters('editRequests', ['locations']),
  },
};
</script>

<style lang="scss">
.fc-layout-request-editor {
  width: 100%;

  & > .fc-pane-wrapper > div {
    flex-basis: 0;
    width: 50%;
  }

  & > .fc-pane-wrapper > .fc-drawer {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
  }
}

</style>
