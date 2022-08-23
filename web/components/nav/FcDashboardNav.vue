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
      icon="download"
      label="Manage Exports"
      :to="{ name: 'downloadsManage' }">
      <div class="fc-badge-wrapper">
        <v-badge v-if="newExportsCount > 0"
          :content="manageExportsBadgeContent"
          :dot=false></v-badge>
      </div>
    </FcDashboardNavItem>

    <FcDashboardNavItem
      external
      icon="help-circle-outline"
      label="MOVE Help Centre"
      href="https://notion.so/MOVE-Help-Centre-8a345a510b1a4119a1ddef5aa03e1bdc" />

    <FcDashboardNavItem
      icon="bug"
      label="Report an Issue"
      :href="urlReportIssue" />
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
      reportIssueEmailBody:
`Use this template to report an issue with MOVE. Please answer the prompts, and provide as much detail as possible. We will get back to you within 1-2 business days if we need more information.

SUMMARY (A concise, 1-2 sentence description of the issue you encountered)

ENVIRONMENT (Please check the version number in the header, for example: "prod v1.9.0")

STEPS TO REPRODUCE (Please include detailed steps to reproduce the issue)

WHAT SHOULD HAPPEN (What did you expect to happen?)

WHAT HAPPENS (What actually happened?)

NOTES (Any additional information you can provide about the issue)

SCREENSHOT (Attach a screenshot of your issue)`,
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
    urlReportIssue() {
      const subject = 'MOVE Issue Report';
      const subjectEncoded = window.encodeURIComponent(subject);
      const bodyEncoded = window.encodeURIComponent(this.reportIssueEmailBody);
      return `mailto:move-team@toronto.ca?subject=${subjectEncoded}&body=${bodyEncoded}`;
    },
    username() {
      if (this.auth.loggedIn) {
        return formatUsername(this.auth.user);
      }
      return '';
    },
    manageExportsBadgeContent() {
      let content = this.newExportsCount;
      if (this.newExportsCount > 9) content = '+';
      return content;
    },
    ...mapState(['auth']),
    ...mapGetters(['locationsEmpty', 'locationsRouteParams', 'newExportsCount']),
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

<style lang="scss">
  .fc-badge-wrapper .v-badge {
    position: relative;
    right: 3px;
    bottom: 6px;
  }
</style>
