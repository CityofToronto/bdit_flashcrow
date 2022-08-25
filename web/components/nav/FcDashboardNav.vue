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
          :dot="isPreparingExport"
          :content="manageExportsBadgeContent"></v-badge>
      </div>
    </FcDashboardNavItem>
    <v-tooltip right :open-on-hover="false" :open-on-focus="false">
      <template v-slot:activator="{ on, attrs }">
        <span class='download-ready'
          ref='downloadReady'
          v-bind="attrs"
          v-on="on"></span>
      </template>
      <span>Download Ready</span>
    </v-tooltip>

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
import { mapGetters, mapState, mapMutations } from 'vuex';

import { formatUsername } from '@/lib/StringFormatters';
import { getJobs } from '@/lib/api/WebApi';
import FcDashboardNavItem from '@/web/components/nav/FcDashboardNavItem.vue';

export default {
  name: 'FcDashboardNav',
  components: {
    FcDashboardNavItem,
  },
  data() {
    return {
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
    ...mapState(['auth', 'newExportsCount']),
    ...mapGetters(['locationsEmpty', 'locationsRouteParams', 'newExportsCount', 'isPreparingExport', 'toast']),
  },
  watch: {
    'auth.loggedIn': function watchAuthLoggedIn() {
      this.loadAsync();
    },
    newExportsCount: function watchNewExportsCount(newCount, oldCount) {
      if (oldCount !== null && newCount > oldCount
        && this.toast === null) this.showDownloadReadyToastTip();
    },
  },
  created() {
    this.loadAsync();
  },
  methods: {
    showDownloadReadyToastTip(delay = 5000) {
      this.$refs.downloadReady.click();
      setTimeout(() => {
        this.$refs.downloadReady.click();
      }, delay);
    },
    async loadAsync() {
      if (!this.auth.loggedIn) {
        this.jobsExistsNew = false;
        return;
      }

      this.loading = true;
      const jobs = await getJobs();
      const newExports = jobs.filter(j => !j.dismissed);
      this.setNewExportsCount(newExports.length);
      this.loading = false;
    },
    ...mapMutations(['setNewExportsCount']),
  },
};
</script>

<style lang="scss">
  .v-badge--dot {
    position: relative;
    bottom: 8px;
    right: 1px;
    .v-badge__badge {
      animation: pulsar 1s ease infinite;
    }
  }

  .fc-badge-wrapper .v-badge:not(.v-badge--dot) {
    position: relative;
    right: 3px;
    bottom: 6px;
    .v-badge__badge {
      font-size: 10px;
      height: 18px;
      min-width: 18px;
    }
  }

  @keyframes pulsar {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }

  .download-ready {
    height: 0;
    width: 100%;
    position: absolute;
    visibility: hidden;
  }
</style>
