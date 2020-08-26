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
      <FcCardJob
        v-for="job in jobs"
        :key="job.jobId"
        :job="job" />
    </section>
  </section>
</template>

<script>
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
  methods: {
    async actionRefresh() {
      this.loading = true;
      await this.loadAsyncForRoute();
      this.loading = false;
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
  max-height: 100vh;
  width: 100%;
}
</style>
