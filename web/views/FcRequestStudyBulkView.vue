<template>
  <section class="fc-request-study-bulk-view d-flex flex-column fill-height">
    <v-row
      class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 py-2 shading"
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
            Bulk Request #{{$route.params.id}}:
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
            {{studyRequestBulk.name}}
          </span>
        </h1>
      </v-col>
      <v-col class="text-right" cols="2">
        <FcButton
          v-if="studyRequestBulk !== null && canEdit && bulkStatus.editable"
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
              {{studyRequestBulk.name}}
            </h2>
            <FcStatusStudyRequests
              class="mt-2"
              :created-at="studyRequestBulk.createdAt"
              :study-requests="studyRequestBulk.studyRequests"
              :study-request-changes="studyRequestChanges" />
          </v-col>
          <v-col cols="6">
            <FcSummaryStudyRequest
              class="mx-5"
              :study-request="studyRequestBulk"
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

        <div class="mb-6 mx-5">
          <div class="align-center d-flex px-4 py-2">
            <v-simple-checkbox
              v-model="selectAll"
              class="mr-6"
              :indeterminate="selectAll === null"></v-simple-checkbox>

            <FcMenu
              button-class="mr-2"
              :items="itemsStatus">
              <span>Mark all as</span>
            </FcMenu>
            <FcMenu
              button-class="mr-2"
              :items="itemsAssignedTo">
              <span>Assign all to</span>
            </FcMenu>
          </div>

          <v-divider></v-divider>

          <FcDataTableRequests
            v-model="selectedItems"
            :columns="columns"
            :has-filters="false"
            :items="items"
            :loading="false"
            :loading-items="loadingSaveStudyRequest"
            :sort-by.sync="sortBy"
            @assign-to="actionAssignTo"
            @show-item="actionShowItem" />
        </div>
      </div>
    </section>
  </section>
</template>

<script>
import { mapActions } from 'vuex';

import { AuthScope, StudyRequestAssignee } from '@/lib/Constants';
import { getStudyRequestBulk } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import { getStudyRequestItem } from '@/lib/requests/RequestItems';
import RequestDataTableColumns from '@/lib/requests/RequestDataTableColumns';
import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcStatusStudyRequests from '@/web/components/requests/status/FcStatusStudyRequests.vue';
import FcSummaryStudyRequest from '@/web/components/requests/summary/FcSummaryStudyRequest.vue';
import FcPaneMap from '@/web/components/FcPaneMap.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMenu from '@/web/components/inputs/FcMenu.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcRequestStudyBulkView',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcDataTableRequests,
    FcMenu,
    FcPaneMap,
    FcStatusStudyRequests,
    FcSummaryStudyRequest,
  },
  data() {
    return {
      columns: RequestDataTableColumns,
      loadingMoreActions: false,
      loadingSaveStudyRequest: new Set(),
      selectedItems: [],
      sortBy: 'DUE_DATE',
      studyRequestBulk: null,
      studyRequestChanges: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    bulkStatus() {
      if (this.studyRequestBulk === null) {
        return null;
      }
      return bulkStatus(this.studyRequestBulk.studyRequests);
    },
    canEdit() {
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return true;
      }
      if (this.studyRequestBulk !== null && this.hasAuthScope(AuthScope.STUDY_REQUESTS_EDIT)) {
        return this.auth.user.id === this.studyRequestBulk.userId;
      }
      return false;
    },
    items() {
      if (this.studyRequestBulk === null) {
        return [];
      }
      return this.studyRequestBulk.studyRequests.map(
        studyRequest => getStudyRequestItem(
          this.studyRequestLocations,
          this.studyRequestUsers,
          studyRequest,
        ),
      );
    },
    itemsAssignedTo() {
      return [
        { text: 'None', value: null },
        ...StudyRequestAssignee.enumValues.map(
          enumValue => ({ text: enumValue.text, value: enumValue }),
        ),
      ];
    },
    itemsStatus() {
      // TODO: actually implement this
      return [{ text: 'test', value: 'test' }];
    },
    labelNavigateBack() {
      return 'Requests';
    },
    routeNavigateBack() {
      return { name: 'requestsTrack' };
    },
    selectAll: {
      get() {
        const k = this.selectedItems.length;
        if (k === 0) {
          return false;
        }
        if (k === this.items.length) {
          return true;
        }
        return null;
      },
      set(selectAll) {
        if (selectAll) {
          this.selectedItems = this.items;
        } else {
          this.selectedItems = [];
        }
      },
    },
  },
  methods: {
    actionAssignTo() {
      // TODO: implement this
    },
    actionEdit() {
      const { id } = this.studyRequestBulk;
      const route = {
        name: 'requestStudyBulkEdit',
        params: { id },
      };
      this.$router.push(route);
    },
    actionNavigateBack() {
      this.$router.push(this.routeNavigateBack);
    },
    actionShowItem(item) {
      const { id } = item.studyRequest;
      const route = {
        name: 'requestStudyView',
        params: { id },
      };
      this.$router.push(route);
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const {
        studyRequestBulk,
        studyRequestChanges,
        studyRequestLocations,
        studyRequestUsers,
      } = await getStudyRequestBulk(id);
      const { s1, selectionType } = studyRequestBulk;
      const features = CompositeId.decode(s1);
      await this.initLocations({ features, selectionType });

      this.studyRequestBulk = studyRequestBulk;
      this.studyRequestChanges = studyRequestChanges;
      this.studyRequestLocations = studyRequestLocations;

      const { user } = this.auth;
      this.studyRequestUsers.set(user.id, user);
      this.studyRequestUsers = studyRequestUsers;
    },
    ...mapActions(['initLocations']),
  },
};
</script>

<style lang="scss">
.fc-request-study-bulk-view {
  max-height: calc(100vh - 52px);
  width: 100%;
}
</style>
