<template>
  <div class="fc-display-request-study-view flex-container-column">
    <div class="nav-links flex-container-row px-l pt-l pb-s text-size-l">
      <router-link :to="linkBack">
        <i class="fa fa-chevron-left"></i>
        <span> Back to All</span>
      </router-link>
    </div>
    <div class="flex-fill flex-container-column">
      <div class="px-l">
        <hr />
      </div>
      <div
        v-if="studyRequest === null"
        class="request-loading-spinner ml-l mt-l">
        <TdsLoadingSpinner />
      </div>
      <div
        v-else
        class="flex-fill flex-container-column">
        <header class="flex-container-row px-l">
          <h2>
            Request #{{studyRequest.id}}
            <span
              v-if="studyRequestLocation !== null">
              at
              <router-link :to="linkLocation">
                <span> {{studyRequestLocation.description}}</span>
              </router-link>
            </span>
          </h2>
          <div class="flex-fill"></div>
          <button
            v-if="auth.user.subject === studyRequest.userSubject || isSupervisor"
            class="font-size-l uppercase"
            @click="onActionEdit">
            <i class="fa fa-edit" />
            <span> Edit</span>
          </button>
        </header>
        <section class="flex-fill flex-container-row">
          <div class="flex-cross-scroll px-l">
            <FcSummaryStudyRequest
              :study-request="studyRequest" />
            <FcSummaryStudy
              v-for="(_, i) in studyRequest.studies"
              :key="i"
              :index="i"
              :study-request="studyRequest" />
            <FcCommentsStudyRequest
              :size-limit="240"
              :study-request="studyRequest" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import FcCommentsStudyRequest from '@/web/components/FcCommentsStudyRequest.vue';
import FcSummaryStudy from '@/web/components/FcSummaryStudy.vue';
import FcSummaryStudyRequest from '@/web/components/FcSummaryStudyRequest.vue';
import TdsLoadingSpinner from '@/web/components/tds/TdsLoadingSpinner.vue';
import { HttpStatus } from '@/lib/Constants';
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
  name: 'FcDisplayRequestStudyView',
  components: {
    FcCommentsStudyRequest,
    FcSummaryStudy,
    FcSummaryStudyRequest,
    TdsLoadingSpinner,
  },
  data() {
    return {
      location: null,
    };
  },
  computed: {
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    linkBack() {
      const route = { name: 'requestsTrack' };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      return route;
    },
    linkLocation() {
      const { centrelineId, centrelineType } = this.studyRequest;
      return {
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      };
    },
    ...mapState([
      'auth',
      'studyRequest',
      'studyRequestComments',
      'studyRequestLocation',
    ]),
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
    onActionEdit() {
      if (this.studyRequest === null) {
        return;
      }
      const { id } = this.studyRequest;
      const route = {
        name: 'requestStudyEdit',
        params: { id },
      };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      this.$router.push(route);
    },
    syncFromRoute(to) {
      const { id } = to.params;
      return this.fetchStudyRequest({ id })
        .then(() => {
          this.setLocation(this.studyRequestLocation);
        })
        .catch((err) => {
          const toast = getToast(err);
          this.setToast(toast);
          this.$router.push({ name: 'viewData' });
        });
    },
    ...mapActions(['fetchStudyRequest', 'setToast']),
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="postcss">
.fc-display-request-study-view {
  & > .nav-links {
    text-transform: uppercase;
    & > a {
      text-decoration: none;
    }
  }
  .request-loading-spinner {
    height: var(--space-2xl);
    width: var(--space-2xl);
  }
  header {
    align-items: center;
  }
}
</style>
