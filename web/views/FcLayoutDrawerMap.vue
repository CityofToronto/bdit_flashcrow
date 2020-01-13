<template>
  <v-row
    class="fill-height"
    no-gutters>
    <v-col
      v-show="drawerOpen"
      cols="4">
      <router-view></router-view>
    </v-col>
    <v-col :cols="drawerOpen ? 8 : 12">
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
