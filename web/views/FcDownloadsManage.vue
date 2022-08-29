<template>
  <div class="fc-downloads-manage d-flex flex-column fill-height">
    <section class="flex-grow-1 flex-shrink-1 mb-8 overflow-y-auto px-5">
      <div
        v-if="loading"
        class="ma-3 mt-9 text-center">
        <FcProgressCircular
          aria-label="Loading your exports"
          class="ma-3" />
        <div class="font-weight-regular headline secondary--text">
          This page is loading, please wait.
        </div>
      </div>
      <v-card
        v-else-if="jobs.length === 0"
        class="mt-6"
        outlined>
        <v-card-title>
          <div>
            <div class="display-1 font-weight-bold">No exports available</div>
            <div class="body-1 mt-1">
              Exports are collections of multiple reports that need pre-processing
              before they can be downloaded. Exports requested in MOVE can be downloaded
              from this page when they are ready.
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
        <h2 class="display-3 my-4">
          <span>Exports</span>
        </h2>
        <FcSectionJobs :jobs="jobs" />
      </template>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getJobs } from '@/lib/api/WebApi';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSectionJobs from '@/web/components/jobs/FcSectionJobs.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDownloadsManage',
  mixins: [
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcProgressCircular,
    FcSectionJobs,
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
  .v-card__title .body-1 {
    word-break: normal;
  }
}
</style>
