<template>
  <div class="fc-drawer-view-request d-flex flex-column">
    <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 py-2 shading">
      <FcButton
        type="secondary"
        @click="actionNavigateBack">
        <v-icon left>mdi-chevron-left</v-icon>
        {{labelNavigateBack}}
      </FcButton>
      <h1 class="flex-grow-1 headline text-center">
        <span>
          {{title}}:
        </span>
        <span class="font-weight-regular">
          {{subtitle}}
        </span>
      </h1>
      <FcButton
        v-if="canEdit"
        :disabled="loading"
        type="secondary"
        @click="actionEdit">
        <v-icon color="primary" left>mdi-pencil</v-icon> Edit
      </FcButton>
    </div>
    <v-divider></v-divider>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <div v-else>
        <FcSummaryStudyRequest
          :study-request="studyRequest"
          :study-request-users="studyRequestUsers" />
        <v-divider></v-divider>
        <FcCommentsStudyRequest
          :size-limit="240"
          :study-request="studyRequest"
          :study-request-comments="studyRequestComments"
          :study-request-users="studyRequestUsers"
          @add-comment="onAddComment"
          @delete-comment="onDeleteComment" />
      </div>
    </section>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { AuthScope } from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import FcCommentsStudyRequest from '@/web/components/FcCommentsStudyRequest.vue';
import FcSummaryStudyRequest from '@/web/components/FcSummaryStudyRequest.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerViewRequest',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcCommentsStudyRequest,
    FcSummaryStudyRequest,
  },
  data() {
    return {
      studyRequest: null,
      studyRequestComments: [],
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    canEdit() {
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return true;
      }
      if (this.studyRequest !== null && this.hasAuthScope(AuthScope.STUDY_REQUESTS_EDIT)) {
        return this.auth.user.id === this.studyRequest.userId;
      }
      return false;
    },
    labelNavigateBack() {
      const { backViewRequest: { name } } = this;
      if (name === 'viewDataAtLocation') {
        return 'View Data';
      }
      return 'Requests';
    },
    subtitle() {
      if (this.location === null) {
        return '';
      }
      return this.location.description;
    },
    title() {
      const { id } = this.$route.params;
      return `Request #${id}`;
    },
    ...mapState(['auth', 'backViewRequest', 'location']),
  },
  methods: {
    actionEdit() {
      const { id } = this.studyRequest;
      const route = {
        name: 'requestStudyEdit',
        params: { id },
      };
      this.$router.push(route);
    },
    actionNavigateBack() {
      const { backViewRequest: route } = this;
      this.$router.push(route);
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const {
        studyRequest,
        studyRequestComments,
        studyRequestLocation,
        studyRequestUsers,
      } = await getStudyRequest(id);
      this.studyRequest = studyRequest;
      this.studyRequestComments = studyRequestComments;
      this.studyRequestUsers = studyRequestUsers;
      this.setLocation(studyRequestLocation);
    },
    onAddComment(comment) {
      this.studyRequestComments.unshift(comment);
    },
    onDeleteComment(i) {
      this.studyRequestComments.splice(i, 1);
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-request {
  max-height: 100vh;
}
</style>
