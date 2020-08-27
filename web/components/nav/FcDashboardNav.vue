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
    <FcDashboardNavItem
      :badge="jobsExistsNew"
      icon="download"
      label="Manage Downloads"
      :to="{ name: 'downloadsManage' }" />
  </v-list>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { getJobsExistsNew } from '@/lib/api/WebApi';
import FcDashboardNavItem from '@/web/components/nav/FcDashboardNavItem.vue';

export default {
  name: 'FcDashboardNav',
  components: {
    FcDashboardNavItem,
  },
  data() {
    return {
      jobsExistsNew: false,
      loading: true,
    };
  },
  computed: {
    toViewMap() {
      if (this.locationsEmpty) {
        return { name: 'viewData' };
      }
      const params = this.locationsRouteParams;
      return {
        name: 'viewDataAtLocation',
        params,
      };
    },
    ...mapState(['auth']),
    ...mapGetters(['locationsEmpty', 'locationsRouteParams']),
  },
  watch: {
    'auth.loggedIn': function watchAuthLoggedIn() {
      this.loadAsync();
    },
  },
  created() {
    this.loadAsync();
  },
  methods: {
    async loadAsync() {
      if (!this.auth.loggedIn) {
        this.jobsExistsNew = false;
        return;
      }

      this.loading = true;
      const jobsExistsNew = await getJobsExistsNew();
      this.jobsExistsNew = jobsExistsNew;
      this.loading = false;
    },
  },
};
</script>
