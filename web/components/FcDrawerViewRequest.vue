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
      <FcButton
        v-if="studyRequest !== null && studyRequest.status.dataViewable"
        :disabled="loading"
        type="secondary"
        @click="actionViewData">
        View Data
      </FcButton>
      <FcButton
        v-else-if="studyRequest !== null && canEdit && studyRequest.status.editable"
        :disabled="loading"
        type="secondary"
        @click="actionEdit">
        <v-icon color="primary" left>mdi-pencil</v-icon> Edit
      </FcButton>
      <v-menu
        v-if="itemsMoreActions.length > 0"
        left>
        <template v-slot:activator="{ on: onMenu }">
          <v-tooltip
            right
            :z-index="100">
            <template v-slot:activator="{ on: onTooltip }">
              <FcButton
                aria-label="More Actions"
                class="ml-2"
                :loading="loadingMoreActions"
                type="icon"
                v-on="{ ...onMenu, ...onTooltip }">
                <v-icon>mdi-dots-vertical</v-icon>
              </FcButton>
            </template>
            <span>More Actions</span>
          </v-tooltip>
        </template>
        <v-list>
          <template
            v-for="(item, i) in itemsMoreActions">
            <v-divider
              v-if="item === null"
              :key="'divider_' + i" />
            <v-list-item
              v-else
              :key="item.value"
              @click="actionMoreActions(item.value)">
              <v-list-item-title>
                {{item.label}}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </div>
    <v-divider></v-divider>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <div v-else>
        <FcSummaryStudyRequest
          :study-request="studyRequest"
          :study-request-changes="studyRequestChanges"
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
import { mapActions, mapMutations, mapState } from 'vuex';

import { AuthScope, StudyRequestStatus } from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
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
    ...mapState(['auth', 'backViewRequest', 'location']),
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
      if (this.location === null) {
        return;
      }
      const features = [this.location];
      const s1 = CompositeId.encode(features);
      const route = {
        name: 'viewDataAtLocation',
        params: { s1 },
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
      this.setLocation(studyRequestLocation);
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
    ...mapMutations(['setLocation']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-request {
  max-height: 100vh;
}
</style>
