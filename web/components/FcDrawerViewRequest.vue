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
                type="icon"
                v-on="{ ...onMenu, ...onTooltip }">
                <v-icon>mdi-dots-vertical</v-icon>
              </FcButton>
            </template>
            <span>More Actions</span>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item
            v-for="{ label, value } in itemsMoreActions"
            :key="value"
            @click="actionMoreActions(value)">
            <v-list-item-title>
              {{label}}
            </v-list-item-title>
          </v-list-item>
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

import { AuthScope, StudyRequestStatus } from '@/lib/Constants';
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
        && this.studyRequest.status === StudyRequestStatus.CANCELLED;
    },
    canRequestChanges() {
      return this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)
        && this.studyRequest !== null
        && this.studyRequest.status.canTransitionTo(StudyRequestStatus.CHANGES_NEEDED);
    },
    itemsMoreActions() {
      const items = [];
      if (this.canCancel) {
        items.push({ label: 'Cancel', value: 'cancel' });
      }
      if (this.canClose) {
        items.push({ label: 'Close', value: 'close' });
      }
      if (this.canReopen) {
        items.push({ label: 'Reopen', value: 'reopen' });
      }
      if (this.canRequestChanges) {
        items.push({ label: 'Request Changes', value: 'requestChanges' });
      }
      return items;
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
    actionCancel() {
      // TODO: implement this
    },
    actionClose() {
      // TODO: implement this
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
      if (value === 'cancel') {
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
    actionReopen() {
      // TODO: implement this
    },
    actionRequestChanges() {
      // TODO: implement this
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const {
        studyRequest,
        studyRequestComments,
        studyRequestLocation,
        studyRequestUsers,
      } = await getStudyRequest(id);
      const { user } = this.auth;
      this.studyRequestUsers.set(user.id, user);

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
