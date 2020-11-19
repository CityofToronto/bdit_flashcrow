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
        'requestStudyBulkEdit',
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

    <FcDashboardNavItem
      icon="bug"
      label="Report a Bug"
      :href="urlReportBug"
      target="_blank" />
    <FcDashboardNavItem
      icon="help-circle"
      label="MOVE Help Centre"
      href="https://www.notion.so/bditto/MOVE-Help-Centre-8a345a510b1a4119a1ddef5aa03e1bdc"
      target="_blank" />
  </v-list>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { formatUsername } from '@/lib/StringFormatters';
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
    urlReportBug() {
      const paramUsername = encodeURIComponent(this.username);
      const url = `${window.location.origin}${this.$route.fullPath}`;
      const paramUrl = encodeURIComponent(url);
      return `https://docs.google.com/forms/d/e/1FAIpQLSeENA2S8dA678ENanNFwdZ811TUjVjIYolloBlRo12idib5UQ/viewform?entry.135357596=${paramUsername}&entry.1262500898=${paramUrl}`;
    },
    username() {
      if (this.auth.loggedIn) {
        return formatUsername(this.auth.user);
      }
      return '';
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
