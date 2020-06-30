<template>
  <v-list
    class="d-flex fill-height flex-column justify-center"
    dense>
    <FcDashboardNavItem
      :active-route-names="[
        'viewCollisionReportsAtLocation',
        'viewDataAtLocation',
        'viewStudyReportsAtLocation',
      ]"
      icon="map"
      label="View Map"
      :to="toViewMap" />
    <FcDashboardNavItem
      :active-route-names="[
        'requestStudyEdit',
        'requestStudyNew',
      ]"
      icon="clipboard-list"
      label="Track Requests"
      :to="{ name: 'requestsTrack' }" />
  </v-list>
</template>

<script>
import { mapState } from 'vuex';

import CompositeId from '@/lib/io/CompositeId';
import FcDashboardNavItem from '@/web/components/nav/FcDashboardNavItem.vue';

export default {
  name: 'FcDashboardNav',
  components: {
    FcDashboardNavItem,
  },
  computed: {
    toViewMap() {
      if (this.location === null) {
        return { name: 'viewData' };
      }
      const features = [this.location];
      const s1 = CompositeId.encode(features);
      return {
        name: 'viewDataAtLocation',
        params: { s1 },
      };
    },
    ...mapState(['location']),
  },
};
</script>
