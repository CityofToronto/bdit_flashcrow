<template>
  <section class="fc-request-study-view d-flex flex-column fill-height">
    <FcNavStudyRequest
      :study-request="studyRequest"
      :study-request-bulk-name="studyRequestBulkName">
      <FcMenuStudyRequestsStatus
        v-if="studyRequest !== null"
        button-class="ml-2"
        :status="studyRequest.status"
        :study-requests="[studyRequest]"
        @update="onUpdateStudyRequest" />
    </FcNavStudyRequest>

    <v-divider></v-divider>

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <section
        v-else
        aria-labelledby="heading_request_details">
        <v-row
          class="mb-6"
          no-gutters>
          <v-col class="mt-6 px-5" cols="12">
            <h3 class="display-2 mb-4" id="heading_request_details">
              Details
            </h3>

            <div class="subtitle-1 pb-2">Status</div>
            <FcStatusStudyRequests
              class="my-2"
              :created-at="studyRequest.createdAt"
              :study-requests="[studyRequest]"
              :study-request-changes="studyRequestChanges" />
          </v-col>
          <v-col class="px-5" cols="6">
            <FcSummaryStudyRequest
              :study-request="studyRequest"
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
          :study-request="studyRequest"
          :study-request-comments="studyRequestComments"
          :study-request-users="studyRequestUsers"
          @add-comment="onAddComment"
          @delete-comment="onDeleteComment" />
      </section>
    </div>
  </section>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import { getStudyRequest, getStudyRequestBulkName } from '@/lib/api/WebApi';
import FcPaneMap from '@/web/components/FcPaneMap.vue';
import FcCommentsStudyRequest from '@/web/components/requests/FcCommentsStudyRequest.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMenuStudyRequestsStatus
  from '@/web/components/requests/status/FcMenuStudyRequestsStatus.vue';
import FcStatusStudyRequests from '@/web/components/requests/status/FcStatusStudyRequests.vue';
import FcSummaryStudy from '@/web/components/requests/summary/FcSummaryStudy.vue';
import FcSummaryStudyRequest from '@/web/components/requests/summary/FcSummaryStudyRequest.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcRequestStudyView',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  components: {
    FcCommentsStudyRequest,
    FcMenuStudyRequestsStatus,
    FcNavStudyRequest,
    FcPaneMap,
    FcStatusStudyRequests,
    FcSummaryStudy,
    FcSummaryStudyRequest,
  },
  data() {
    return {
      studyRequest: null,
      studyRequestBulkName: null,
      studyRequestChanges: [],
      studyRequestComments: [],
      studyRequestLocation: null,
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    ...mapState(['locations']),
  },
  methods: {
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
      this.setToastInfo('Your comment has been submitted.');
    },
    onDeleteComment({ studyRequest, i }) {
      this.studyRequest = studyRequest;
      this.studyRequestComments.splice(i, 1);
      this.setToastInfo('Your comment has been deleted.');
    },
    async onUpdateStudyRequest() {
      this.loading = true;
      await this.saveStudyRequest(this.studyRequest);
      await this.loadAsyncForRoute(this.$route);
      this.loading = false;
    },
    ...mapMutations(['setToastInfo']),
    ...mapActions(['initLocations', 'saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-request-study-view {
  max-height: var(--full-height);
  width: 100%;

  & .pane-map {
    min-height: 400px;
  }
}
</style>
