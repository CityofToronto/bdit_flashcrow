<template>
  <div class="fc-drawer-view-request d-flex flex-column">
    <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 py-2 shading">
      <FcButton
        type="secondary"
        @click="actionNavigateBack">
        <v-icon left>mdi-chevron-left</v-icon>
        Requests
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
        v-if="!loading && (auth.user.id === studyRequest.userId || isSupervisor)"
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
        <div class="pl-5">
          <FcSummaryStudyRequest
            class="pr-5"
            :study-request="studyRequest" />
          <template v-for="(study, i) in studyRequest.studies">
            <v-divider :key="'divider_' + i"></v-divider>
            <FcSummaryStudy
              :key="'study_' + i"
              class="pr-5"
              :study="study" />
          </template>
        </div>
        <v-divider></v-divider>
        <FcCommentsStudyRequest
          :size-limit="240"
          :study-request="studyRequest"
          :study-request-comments="studyRequestComments"
          :study-request-comment-users="studyRequestCommentUsers"
          @add-comment="onAddComment"
          @delete-comment="onDeleteComment" />
      </div>
    </section>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import {
  getStudyRequest,
} from '@/lib/api/WebApi';
import FcCommentsStudyRequest from '@/web/components/FcCommentsStudyRequest.vue';
import FcSummaryStudy from '@/web/components/FcSummaryStudy.vue';
import FcSummaryStudyRequest from '@/web/components/FcSummaryStudyRequest.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerViewRequest',
  mixins: [FcMixinRouteAsync],
  components: {
    FcButton,
    FcCommentsStudyRequest,
    FcSummaryStudy,
    FcSummaryStudyRequest,
  },
  data() {
    return {
      studyRequest: null,
      studyRequestComments: [],
      studyRequestCommentUsers: new Map(),
    };
  },
  computed: {
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
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
    ...mapState(['auth', 'location']),
  },
  methods: {
    actionEdit() {
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
    actionNavigateBack() {
      const route = { name: 'requestsTrack' };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      this.$router.push(route);
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const {
        studyRequest,
        studyRequestComments,
        studyRequestCommentUsers,
        studyRequestLocation,
      } = await getStudyRequest(id);
      this.studyRequest = studyRequest;
      this.studyRequestComments = studyRequestComments;
      this.studyRequestCommentUsers = studyRequestCommentUsers;
      this.setLocation(studyRequestLocation);
    },
    onAddComment(comment) {
      this.studyRequestComments.push(comment);
    },
    onDeleteComment(i) {
      this.studyRequestComments.splice(i, 1);
    },
    ...mapActions(['setToast']),
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-request {
  max-height: 100vh;
}
</style>
