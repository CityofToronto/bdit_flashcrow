<template>
  <section class="fc-downloads-manage d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-divider></v-divider>
      <div class="px-5">
        <h1 class="display-3 mt-8">Manage Downloads</h1>
      </div>
    </header>

    <section class="flex-grow-1 flex-shrink-1 mt-6 mb-8 overflow-y-auto px-5">
      <v-card class="fc-downloads-manage-card">
        <v-card-title class="align-center d-flex py-2">
          <FcButton
            class="mr-2"
            :loading="loading"
            type="secondary"
            @click="actionRefresh()">
            <v-icon
              color="primary"
              left>mdi-refresh</v-icon>
            Refresh
          </FcButton>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="fc-downloads-wrapper overflow-y-scroll pa-0">
          <pre class="ma-5">
            {{JSON.stringify(jobs, null, 2)}}
          </pre>
        </v-card-text>
      </v-card>
    </section>
  </section>
</template>

<script>
import { getJobs } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDownloadsManage',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
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

  & .fc-downloads-manage-card {
    height: calc(100% - 4px);
  }

  & .fc-downloads-wrapper {
    height: calc(100% - 53px);
  }
}
</style>
