<template>
  <main class="fc-request-study-view flex-fill flex-container-column">
    <TdsTopBar class="nav-links text-size-l">
      <template v-slot:left>
        <router-link
          :to="{ name: 'requestsTrack' }">
          <i class="fa fa-chevron-left"></i>
          <span> Back to All</span>
        </router-link>
      </template>
    </TdsTopBar>
    <div class="px-xl flex-fill flex-container-column">
      <hr />
      <div
        v-if="studyRequest !== null"
        class="flex-fill flex-container-column">
        <header class="flex-container-row">
          <h2>
            Request #{{studyRequest.id}}
            <span
              v-if="studyRequestLocation !== null">
              at
              <router-link
                :to="{
                  name: 'viewDataAtLocation',
                  params: {
                    centrelineId: studyRequest.centrelineId,
                    centrelineType: studyRequest.centrelineType,
                  }
                }">
                <span> {{studyRequestLocation.description}}</span>
              </router-link>
            </span>
          </h2>
          <div class="flex-fill"></div>
          <TdsLabel
            class="font-size-l uppercase"
            v-bind="RequestStatus[studyRequest.status]">
            {{studyRequest.status}}
          </TdsLabel>
        </header>
        <section class="flex-fill flex-container-row">
          <div class="flex-cross-scroll">
            <FcSummaryStudyRequest />
            <FcSummaryStudy
              v-for="(_, i) in studyRequest.studies"
              :key="i"
              :index="i" />
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import FcSummaryStudy from '@/web/components/FcSummaryStudy.vue';
import FcSummaryStudyRequest from '@/web/components/FcSummaryStudyRequest.vue';
import TdsLabel from '@/web/components/tds/TdsLabel.vue';
import TdsTopBar from '@/web/components/tds/TdsTopBar.vue';
import { HttpStatus, RequestStatus } from '@/lib/Constants';
import {
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
} from '@/lib/i18n/Strings';

function getToast(err) {
  if (err.statusCode === HttpStatus.FORBIDDEN) {
    return REQUEST_STUDY_FORBIDDEN;
  }
  if (err.statusCode === HttpStatus.NOT_FOUND) {
    return REQUEST_STUDY_NOT_FOUND;
  }
  return {
    variant: 'error',
    text: err.message,
  };
}

export default {
  name: 'FcRequestStudyView',
  components: {
    FcSummaryStudy,
    FcSummaryStudyRequest,
    TdsLabel,
    TdsTopBar,
  },
  data() {
    return {
      location: null,
      RequestStatus,
    };
  },
  computed: {
    ...mapState(['studyRequest', 'studyRequestLocation']),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.syncFromRoute(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.syncFromRoute(to)
      .then(() => {
        next();
      }).catch((err) => {
        next(err);
      });
  },
  methods: {
    syncFromRoute(to) {
      const { id } = to.params;
      return this.fetchStudyRequest(id)
        .catch((err) => {
          const toast = getToast(err);
          this.setToast(toast);
          this.$router.push({ name: 'viewData' });
        });
    },
    ...mapActions(['fetchStudyRequest', 'setToast']),
  },
};
</script>

<style lang="postcss">
.fc-request-study-view {
  & > .nav-links {
    padding: var(--space-l) var(--space-xl) var(--space-s) var(--space-xl);
    text-transform: uppercase;
    & > a {
      text-decoration: none;
    }
  }
  header {
    align-items: center;
  }
}
</style>
