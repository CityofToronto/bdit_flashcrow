<template>
  <v-row
    class="fill-height"
    no-gutters>
    <router-view
      v-show="drawerOpen"
      class="pane-drawer"></router-view>
    <v-col cols="12">
      <PaneMap />
    </v-col>
  </v-row>
</template>

<script>
import { mapState } from 'vuex';

import PaneMap from '@/web/components/PaneMap.vue';

export default {
  name: 'FcLayoutDrawerMap',
  components: {
    PaneMap,
  },
  computed: {
    ...mapState(['drawerOpen']),
  },
};
</script>
