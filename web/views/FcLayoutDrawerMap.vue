<template>
  <v-row
    class="fill-height"
    no-gutters>
    <v-col
      v-show="drawerOpen"
      class="elevation-3"
      cols="6">
      <router-view></router-view>
    </v-col>
    <v-col :cols="drawerOpen ? 6 : 12">
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
