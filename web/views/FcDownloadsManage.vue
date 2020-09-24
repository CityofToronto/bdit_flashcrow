<template>
  <section class="fc-downloads-manage d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-divider></v-divider>
      <div class="align-center d-flex mt-8 px-5">
        <h1 class="display-3">Manage Downloads</h1>

        <v-spacer></v-spacer>

        <FcButton
          :loading="loading"
          type="secondary"
          @click="actionRefresh()">
          <v-icon
            color="primary"
            left>mdi-refresh</v-icon>
          Refresh
        </FcButton>
      </div>
    </header>

    <section class="flex-grow-1 flex-shrink-1 mt-6 mb-8 overflow-y-auto px-5">
      <div
        v-if="loading"
        class="ma-3 text-center">
        <v-progress-circular
          class="ma-3"
          color="primary"
          indeterminate
          size="80" />
        <div class="font-weight-regular headline secondary--text">
          This page is loading, please wait.
        </div>
      </div>
      <v-card
        v-else-if="jobs.length === 0"
        outlined>
        <v-card-title>
          <div>
            <h2>No downloads available</h2>
            <div class="body-1 mt-1">
              Downloads requested when viewing data on the map will show up here.
            </div>
          </div>

          <v-spacer></v-spacer>

          <FcButton
            type="primary"
            @click="actionViewData()">
            <v-icon left>mdi-map</v-icon>
            {{labelViewData}}
          </FcButton>
        </v-card-title>
      </v-card>
      <template v-else>
        <section v-if="jobsSections.inProgress.length > 0">
          <h2 class="my-6">In Progress</h2>
          <FcCardJob
            v-for="job in jobsSections.inProgress"
            :key="job.jobId"
            :job="job" />
        </section>
        <section v-if="jobsSections.newlyCompleted.length > 0">
          <h2 class="my-6">Completed</h2>
          <FcCardJob
            v-for="job in jobsSections.newlyCompleted"
            :key="job.jobId"
            :job="job" />
        </section>
        <section v-if="jobsSections.old.length > 0">
          <h2 class="my-6">History</h2>
          <FcCardJob
            v-for="job in jobsSections.old"
            :key="job.jobId"
            :job="job" />
        </section>
      </template>
    </section>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';

import { getJobs } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcCardJob from '@/web/components/jobs/FcCardJob.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDownloadsManage',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcCardJob,
  },
  data() {
    return {
      jobs: [],
    };
  },
  computed: {
    jobsSections() {
      const jobsSections = {
        inProgress: [],
        newlyCompleted: [],
        old: [],
      };
      this.jobs.forEach((job) => {
        const { dismissed, state } = job;
        if (state === 'created' || state === 'active') {
          jobsSections.inProgress.push(job);
        } else if (state === 'completed' && !dismissed) {
          jobsSections.newlyCompleted.push(job);
        } else {
          jobsSections.old.push(job);
        }
      });
      return jobsSections;
    },
    labelViewData() {
      if (this.locationsEmpty) {
        return 'View Map';
      }
      return 'View Data';
    },
    ...mapGetters(['locationsEmpty', 'locationsRouteParams']),
  },
  methods: {
    async actionRefresh() {
      this.loading = true;
      await this.loadAsyncForRoute();
      this.loading = false;
    },
    actionViewData() {
      let route;
      if (this.locationsEmpty) {
        route = { name: 'viewData' };
      } else {
        const params = this.locationsRouteParams;
        route = {
          name: 'viewDataAtLocation',
          params,
        };
      }
      this.$router.push(route);
    },
    async loadAsyncForRoute() {
      const jobs = await getJobs();
      this.jobs = jobs;
    },
  },
};
</script>

<style lang="scss">
.fc-downloads-manage {
  background-color: var(--v-shading-base);
  max-height: var(--full-height);
  width: 100%;
}
</style>
