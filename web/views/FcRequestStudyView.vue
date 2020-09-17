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
        <FcButton
          v-if="studyRequest !== null && canEdit && studyRequest.status.editable"
          :disabled="loading"
          type="secondary"
          @click="actionEdit">
          <v-icon color="primary" left>mdi-pencil</v-icon> Edit
        </FcButton>
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
            <FcStatusStudyRequest
              class="mt-2"
              :study-request="studyRequest"
              :study-request-changes="studyRequestChanges" />
          </v-col>
          <v-col cols="6">
            <FcSummaryStudyRequest
              class="mr-5"
              :study-request="studyRequest"
              :study-request-changes="studyRequestChanges"
              :study-request-users="studyRequestUsers" />
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
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import { AuthScope, StudyRequestStatus } from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import FcPaneMap from '@/web/components/FcPaneMap.vue';
import FcCommentsStudyRequest from '@/web/components/requests/FcCommentsStudyRequest.vue';
import FcStatusStudyRequest from '@/web/components/requests/FcStatusStudyRequest.vue';
import FcSummaryStudyRequest from '@/web/components/requests/FcSummaryStudyRequest.vue';
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
    FcPaneMap,
    FcStatusStudyRequest,
    FcSummaryStudyRequest,
  },
  data() {
    return {
      loadingMoreActions: false,
      studyRequest: null,
      studyRequestChanges: [],
      studyRequestComments: [],
      studyRequestLocation: null,
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    canAcceptChanges() {
      return this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)
        && this.studyRequest !== null
        && this.studyRequest.status === StudyRequestStatus.CHANGES_NEEDED;
    },
    canCancel() {
      return this.canEdit
        && this.studyRequest !== null
        && this.studyRequest.status.canTransitionTo(StudyRequestStatus.CANCELLED);
    },
    canClose() {
      return this.canEdit
        && this.studyRequest !== null
        && this.studyRequest.status === StudyRequestStatus.COMPLETED
        && !this.studyRequest.closed;
    },
    canEdit() {
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return true;
      }
      if (this.studyRequest !== null && this.hasAuthScope(AuthScope.STUDY_REQUESTS_EDIT)) {
        return this.auth.user.id === this.studyRequest.userId;
      }
      return false;
    },
    canReopen() {
      return this.canEdit
        && this.studyRequest !== null
        && this.studyRequest.closed;
    },
    canRequestChanges() {
      return this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)
        && this.studyRequest !== null
        && this.studyRequest.status.canTransitionTo(StudyRequestStatus.CHANGES_NEEDED);
    },
    itemsMoreActions() {
      const topItems = [];
      if (this.canAcceptChanges) {
        topItems.push({ label: 'Accept Changes', value: 'acceptChanges' });
      }
      if (this.canRequestChanges) {
        topItems.push({ label: 'Request Changes', value: 'requestChanges' });
      }

      const bottomItems = [];
      if (this.canCancel) {
        bottomItems.push({ label: 'Cancel', value: 'cancel' });
      }
      if (this.canClose) {
        bottomItems.push({ label: 'Close', value: 'close' });
      }
      if (this.canReopen) {
        bottomItems.push({ label: 'Reopen', value: 'reopen' });
      }

      const divider = [];
      if (topItems.length > 0 && bottomItems.length > 0) {
        divider.push(null);
      }
      return [
        ...topItems,
        ...divider,
        ...bottomItems,
      ];
    },
    labelNavigateBack() {
      const { backViewRequest: { name } } = this;
      if (name === 'viewDataAtLocation') {
        return 'View Data';
      }
      return 'Requests';
    },
    ...mapState(['auth', 'backViewRequest', 'locations']),
    ...mapGetters(['locationsEmpty', 'locationsRouteParams']),
  },
  methods: {
    async actionAcceptChanges() {
      this.studyRequest.status = StudyRequestStatus.REQUESTED;
      await this.updateMoreActions();
    },
    async actionCancel() {
      this.studyRequest.status = StudyRequestStatus.CANCELLED;
      this.studyRequest.closed = true;
      await this.updateMoreActions();
    },
    async actionClose() {
      this.studyRequest.closed = true;
      await this.updateMoreActions();
    },
    actionEdit() {
      const { id } = this.studyRequest;
      const route = {
        name: 'requestStudyEdit',
        params: { id },
      };
      this.$router.push(route);
    },
    actionMoreActions(value) {
      if (value === 'acceptChanges') {
        this.actionAcceptChanges();
      } else if (value === 'cancel') {
        this.actionCancel();
      } else if (value === 'close') {
        this.actionClose();
      } else if (value === 'reopen') {
        this.actionReopen();
      } else if (value === 'requestChanges') {
        this.actionRequestChanges();
      }
    },
    actionNavigateBack() {
      const { backViewRequest: route } = this;
      this.$router.push(route);
    },
    async actionReopen() {
      if (this.studyRequest.status === StudyRequestStatus.CANCELLED) {
        this.studyRequest.status = StudyRequestStatus.REQUESTED;
      }
      this.studyRequest.closed = false;
      await this.updateMoreActions();
    },
    async actionRequestChanges() {
      this.studyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
      await this.updateMoreActions();
    },
    actionViewData() {
      if (this.locationsEmpty) {
        return;
      }
      const params = this.locationsRouteParams;
      const route = {
        name: 'viewDataAtLocation',
        params,
      };
      this.$router.push(route);
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
      const { user } = this.auth;
      this.studyRequestUsers.set(user.id, user);

      this.studyRequest = studyRequest;
      this.studyRequestChanges = studyRequestChanges;
      this.studyRequestComments = studyRequestComments;
      this.studyRequestLocation = studyRequestLocation;
      this.studyRequestUsers = studyRequestUsers;
      this.setLocations([studyRequestLocation]);
    },
    onAddComment({ studyRequest, studyRequestComment }) {
      this.studyRequest = studyRequest;
      this.studyRequestComments.unshift(studyRequestComment);
    },
    onDeleteComment({ studyRequest, i }) {
      this.studyRequest = studyRequest;
      this.studyRequestComments.splice(i, 1);
    },
    async updateMoreActions() {
      this.loadingMoreActions = true;
      const {
        studyRequest,
        studyRequestChange,
      } = await this.saveStudyRequest(this.studyRequest);
      this.studyRequest = studyRequest;
      if (studyRequestChange !== null) {
        this.studyRequestChanges.unshift(studyRequestChange);
      }
      this.loadingMoreActions = false;
    },
    ...mapMutations(['setLocations']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-request-study-view {
  max-height: calc(100vh - 52px);
  width: 100%;
}
</style>
