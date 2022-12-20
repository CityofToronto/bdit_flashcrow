<template>
  <section class="fc-request-study-view d-flex flex-column fill-height">
    <FcNavStudyRequest
      :study-request="studyRequest"
      :study-request-bulk-name="studyRequestBulkName">
      <template v-if="studyRequest !== null">
        <SetStatusDropdown
          v-if="userIsStudyRequestAdmin && isAnyValidTransitions"
          :currentStatus="currentStatus"
          :statusTransitions="validStatusTransitions"
          @transition-status="updateStatus">
        </SetStatusDropdown>
        <CancelRequestButton
          v-else-if="userIsStudyRequester"
          :disabled="!userCanCancelStudyRequest"
          @cancel-request="cancel">
        </CancelRequestButton>
      </template>
    </FcNavStudyRequest>

    <v-divider></v-divider>

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <FcProgressLinear
        v-if="loading"
        aria-label="Loading study request" />
      <section
        v-else
        aria-labelledby="heading_request_details">
        <v-row
          class="mb-6"
          no-gutters>
          <v-col class="mt-6 px-5" cols="12">
            <h3 class="display-2 mb-4" id="heading_request_details">
              Request Details
            </h3>

            <div class="pt-2 pb-4">
              <div class="subtitle-1 pb-2">Status</div>
              <FcStatusStudyRequests
                class="mt-2 mb-4"
                :created-at="studyRequest.createdAt"
                :study-requests="[studyRequest]"
                :study-request-changes="studyRequestChanges" />
            </div>
          </v-col>
          <v-col class="px-5" cols="6">
            <FcSummaryStudy
              :study="studyRequest" />

            <FcSummaryStudyRequest
              class="mt-8"
              :study-request="studyRequest"
              :study-request-users="studyRequestUsers" />
          </v-col>
          <v-col cols="6">
            <FcMap
              class="mx-5"
              :locations-state="locationsState"
              :show-legend="false" />
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
import { mapActions, mapMutations } from 'vuex';

import { getStudyRequest, getStudyRequestBulkName } from '@/lib/api/WebApi';
import { getStudyRequestLocation } from '@/lib/geo/CentrelineUtils';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcMap from '@/web/components/geo/map/FcMap.vue';
import FcCommentsStudyRequest from '@/web/components/requests/FcCommentsStudyRequest.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import SetStatusDropdown from '@/web/components/requests/status/SetStatusDropdown.vue';
import CancelRequestButton from '@/web/components/requests/status/CancelRequestButton.vue';
import FcStatusStudyRequests from '@/web/components/requests/status/FcStatusStudyRequests.vue';
import FcSummaryStudy from '@/web/components/requests/summary/FcSummaryStudy.vue';
import FcSummaryStudyRequest from '@/web/components/requests/summary/FcSummaryStudyRequest.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

import { StudyRequestStatus } from '@/lib/Constants';
import SrStatusTransitionValidator from '@/lib/SrStatusTransitionValidator';

export default {
  name: 'FcRequestStudyView',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  components: {
    FcCommentsStudyRequest,
    FcMap,
    SetStatusDropdown,
    CancelRequestButton,
    FcNavStudyRequest,
    FcProgressLinear,
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
    locationsState() {
      const location = getStudyRequestLocation(this.studyRequest, this.studyRequestLocation);
      if (location === null) {
        return [];
      }
      const state = {
        deselected: false,
        locationIndex: -1,
        multi: false,
        selected: false,
      };
      return [{ location, state }];
    },
    currentStatus() {
      return this.studyRequest.status;
    },
    userIsStudyRequestAdmin() {
      return this.hasAuthScope(this.AuthScope.STUDY_REQUESTS_ADMIN);
    },
    userIsStudyRequester() {
      return this.auth.user.id === this.studyRequest.userId;
    },
    transitionValidator() {
      return new SrStatusTransitionValidator(this.auth.user.scope);
    },
    validStatusTransitions() {
      return this.transitionValidator.getRulesForScope(this.currentStatus);
    },
    isAnyValidTransitions() {
      return this.validStatusTransitions.length > 0;
    },
    userCanCancelStudyRequest() {
      return this.transitionValidator.isValidTransition(
        this.studyRequest.status, this.cancelledStatus,
      );
    },
    cancelledStatus() {
      return StudyRequestStatus.CANCELLED;
    },
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
    cancel() {
      this.updateStatus(this.cancelledStatus);
    },
    updateStatus(nextStatus) {
      this.showMenu = false;
      this.studyRequest.status = nextStatus;
      this.onUpdateStudyRequest();
      this.setToastInfo(`Request #${this.studyRequest.id} set to "${nextStatus.text}"`);
    },
    async onUpdateStudyRequest() {
      this.loading = true;
      await this.saveStudyRequest(this.studyRequest);
      await this.loadAsyncForRoute(this.$route);
      this.loading = false;
    },
    ...mapMutations(['setToastInfo']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-request-study-view {
  max-height: var(--full-height);
  width: 100%;

  & .fc-map {
    min-height: 400px;
  }
}
</style>
