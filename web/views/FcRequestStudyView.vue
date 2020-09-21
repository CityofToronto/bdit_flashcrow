<template>
  <section class="fc-request-study-view d-flex flex-column fill-height">
    <v-row
      class="align-center flex-grow-0 flex-shrink-0 px-3 py-2 shading"
      no-gutters>
      <v-col cols="2">
        <FcButton
          type="secondary"
          @click="actionNavigateBack">
          <v-icon left>mdi-chevron-left</v-icon>
          {{labelNavigateBack}}
        </FcButton>
      </v-col>
      <v-col class="text-center" cols="8">
        <h1 class="headline">
          <span>
            Request #{{$route.params.id}}:
          </span>
          <v-progress-circular
            v-if="loading"
            color="primary"
            indeterminate
            :size="20"
            :width="2" />
          <span
            v-else
            class="font-weight-regular">
            {{studyRequestLocation.description}}
          </span>
        </h1>
      </v-col>
      <v-col class="text-right" cols="2">
        <template v-if="studyRequest !== null && canEdit">
          <FcButton
            v-if="studyRequest.status.editable"
            :disabled="loading"
            type="secondary"
            @click="actionEdit">
            <v-icon color="primary" left>mdi-pencil</v-icon> Edit
          </FcButton>

          <FcMenuStudyRequestsStatus
            button-class="ml-2"
            :status="studyRequest.status"
            :study-requests="[studyRequest]"
            @update="onUpdateStudyRequest" />
        </template>
      </v-col>
    </v-row>

    <v-divider></v-divider>

    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <div v-else>
        <v-row
          class="mb-6"
          no-gutters>
          <v-col class="mt-6 px-5" cols="12">
            <h2 class="display-3 mb-4">
              {{studyRequestLocation.description}}
            </h2>
            <FcStatusStudyRequests
              class="mt-2"
              :created-at="studyRequest.createdAt"
              :study-requests="[studyRequest]"
              :study-request-changes="studyRequestChanges" />
          </v-col>
          <v-col class="px-5" cols="6">
            <FcSummaryStudyRequest
              :study-request="studyRequest"
              :study-request-changes="studyRequestChanges"
              :study-request-users="studyRequestUsers" />

            <v-divider></v-divider>

            <FcSummaryStudy
              :study="studyRequest" />
          </v-col>
          <v-col cols="6">
            <FcPaneMap
              class="mx-5"
              :show-legend="false"
              :show-location-selection="false"
              :show-modes="false"
              :show-search="false" />
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <FcCommentsStudyRequest
          class="mt-4"
          :size-limit="240"
          :study-request="studyRequest"
          :study-request-comments="studyRequestComments"
          :study-request-users="studyRequestUsers"
          @add-comment="onAddComment"
          @delete-comment="onDeleteComment" />
      </div>
    </section>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { AuthScope, LocationSelectionType } from '@/lib/Constants';
import { getStudyRequest, getStudyRequestBulkName } from '@/lib/api/WebApi';
import FcPaneMap from '@/web/components/FcPaneMap.vue';
import FcCommentsStudyRequest from '@/web/components/requests/FcCommentsStudyRequest.vue';
import FcMenuStudyRequestsStatus
  from '@/web/components/requests/status/FcMenuStudyRequestsStatus.vue';
import FcStatusStudyRequests from '@/web/components/requests/status/FcStatusStudyRequests.vue';
import FcSummaryStudy from '@/web/components/requests/summary/FcSummaryStudy.vue';
import FcSummaryStudyRequest from '@/web/components/requests/summary/FcSummaryStudyRequest.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcRequestStudyView',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcCommentsStudyRequest,
    FcMenuStudyRequestsStatus,
    FcPaneMap,
    FcStatusStudyRequests,
    FcSummaryStudy,
    FcSummaryStudyRequest,
  },
  data() {
    return {
      loadingMoreActions: false,
      studyRequest: null,
      studyRequestBulkName: null,
      studyRequestChanges: [],
      studyRequestComments: [],
      studyRequestLocation: null,
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
      if (this.studyRequestBulkName !== null) {
        return this.studyRequestBulkName;
      }
      return 'Requests';
    },
    routeNavigateBack() {
      if (this.studyRequest === null || this.studyRequest.studyRequestBulkId === null) {
        return { name: 'requestsTrack' };
      }
      const id = this.studyRequest.studyRequestBulkId;
      return {
        name: 'requestStudyBulkView',
        params: { id },
      };
    },
    ...mapState(['auth', 'locations']),
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
      this.$router.push(this.routeNavigateBack);
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const {
        studyRequest,
        studyRequestChanges,
        studyRequestComments,
        studyRequestLocation,
        studyRequestUsers,
      } = await getStudyRequest(id);
      const features = [studyRequestLocation];
      const selectionType = LocationSelectionType.POINTS;
      await this.initLocations({ features, selectionType });

      let studyRequestBulkName = null;
      if (studyRequest.studyRequestBulkId !== null) {
        studyRequestBulkName = await getStudyRequestBulkName(studyRequest.studyRequestBulkId);
      }

      this.studyRequest = studyRequest;
      this.studyRequestBulkName = studyRequestBulkName;
      this.studyRequestChanges = studyRequestChanges;
      this.studyRequestComments = studyRequestComments;
      this.studyRequestLocation = studyRequestLocation;

      const { user } = this.auth;
      this.studyRequestUsers.set(user.id, user);
      this.studyRequestUsers = studyRequestUsers;
    },
    onAddComment({ studyRequest, studyRequestComment }) {
      this.studyRequest = studyRequest;
      this.studyRequestComments.unshift(studyRequestComment);
    },
    onDeleteComment({ studyRequest, i }) {
      this.studyRequest = studyRequest;
      this.studyRequestComments.splice(i, 1);
    },
    async onUpdateStudyRequest() {
      this.loading = true;
      await this.saveStudyRequest(this.studyRequest);
      await this.loadAsyncForRoute(this.$route);
      this.loading = false;
    },
    ...mapActions(['initLocations', 'saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-request-study-view {
  max-height: calc(100vh - 52px);
  width: 100%;
}
</style>
