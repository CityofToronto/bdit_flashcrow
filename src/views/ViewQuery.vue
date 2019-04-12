<template>
  <LayoutMain>
    <template v-slot:navSecondary>
      <b-col cols="2">
        <FilterDate />
      </b-col>
      <b-col cols="2">
        <FilterCountTypes />
      </b-col>
      <b-col cols="2" offset="6" class="text-right">
        <ToggleShowMap />
      </b-col>
    </template>
    <template v-slot:panes>
      <PaneDisplay :cols="colsPaneDisplay">
        <template v-slot:title>
          <h2>Available Data</h2>
        </template>
        <template v-slot:content>
          <p>test</p>
        </template>
        <template v-slot:actionBar>
          <b-col cols="12">
            <router-link
              class="btn btn-primary"
              :to="{name: 'requestsNewRequest'}">
              RequestsNewRequest
            </router-link>
          </b-col>
        </template>
      </PaneDisplay>
      <PaneMap v-if="showMap" :cols="4" />
    </template>
  </LayoutMain>
</template>

<script>
import { mapState } from 'vuex';

import FilterCountTypes from '@/components/FilterCountTypes.vue';
import FilterDate from '@/components/FilterDate.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

export default {
  name: 'ViewQuery',
  components: {
    FilterCountTypes,
    FilterDate,
    LayoutMain,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
  },
  computed: {
    colsPaneDisplay() {
      return this.showMap ? 8 : 12;
    },
    ...mapState(['showMap']),
  },
};
</script>

<style lang="postcss">

</style>
