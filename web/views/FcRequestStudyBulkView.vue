<template>
  <div class="fc-request-study-bulk-view d-flex flex-column fill-height">
    <FcNavStudyRequest
      :study-request="studyRequestBulk" />

    <v-divider></v-divider>

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <section
        v-else
        aria-labelledby="heading_bulk_request_details">
        <v-row
          class="mb-6"
          no-gutters>
          <v-col class="mt-6 px-5" cols="12">
            <h3 class="display-2 mb-4" id="heading_bulk_request_details">
              Details
            </h3>

            <div class="subtitle-1 pb-2">Status</div>
            <FcStatusStudyRequests
              class="my-2"
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

        <v-divider></v-divider>

        <section
          aria-labelledby="heading_bulk_request_requests"
          class="mb-6 mx-5">
          <h3 class="display-2 mt-6 mb-2" id="heading_bulk_request_requests">
            <span>Requests</span>
            <FcTextNumberTotal class="ml-2" :n="items.length" />
          </h3>
          <div class="align-center d-flex px-4 py-2">
            <v-checkbox
              v-model="selectAll"
              class="mt-0"
              hide-details
              :indeterminate="selectAll === null"
              label="Select all" />

            <v-spacer></v-spacer>

            <template v-if="canEdit">
              <FcMenuStudyRequestsStatus
                :disabled="selectAll === false"
                :status="bulkStatus"
                :study-requests="selectedStudyRequests"
                text-screen-reader="Selected Requests"
                @update="onUpdateStudyRequests" />

              <FcMenuStudyRequestsAssignTo
                button-class="ml-2"
                :disabled="selectAll === false"
                :study-requests="selectedStudyRequests"
                text-screen-reader="Selected Requests"
                @update="onUpdateStudyRequests" />
            </template>
          </div>

          <v-divider></v-divider>

          <FcDataTableRequests
            v-model="selectedItems"
            aria-labelledby="heading_bulk_request_requests"
            :columns="columns"
            :has-filters="false"
            :items="items"
            :loading="loadingItems"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            @update-item="actionUpdateItem" />
        </section>
      </section>
    </div>
  </div>
</template>

<script>
import { Ripple } from 'vuetify/lib/directives';
import { mapActions, mapMutations, mapState } from 'vuex';

import { AuthScope } from '@/lib/Constants';
import { getStudyRequestBulk } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import { getStudyRequestItem } from '@/lib/requests/RequestItems';
import RequestDataTableColumns from '@/lib/requests/RequestDataTableColumns';
import { bulkIndicesDeselected, bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMenuStudyRequestsAssignTo
  from '@/web/components/requests/status/FcMenuStudyRequestsAssignTo.vue';
import FcMenuStudyRequestsStatus
  from '@/web/components/requests/status/FcMenuStudyRequestsStatus.vue';
import FcStatusStudyRequests from '@/web/components/requests/status/FcStatusStudyRequests.vue';
import FcSummaryStudyRequest from '@/web/components/requests/summary/FcSummaryStudyRequest.vue';
import FcPaneMap from '@/web/components/FcPaneMap.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcRequestStudyBulkView',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  directives: {
    Ripple,
  },
  components: {
    FcDataTableRequests,
    FcMenuStudyRequestsAssignTo,
    FcMenuStudyRequestsStatus,
    FcNavStudyRequest,
    FcPaneMap,
    FcStatusStudyRequests,
    FcSummaryStudyRequest,
    FcTextNumberTotal,
  },
  data() {
    return {
      columns: RequestDataTableColumns,
      loadingItems: false,
      selectedItems: [],
      sortBy: 'DUE_DATE',
      sortDesc: true,
      studyRequestBulk: null,
      studyRequestChanges: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    bulkStatus() {
      return bulkStatus(this.studyRequestBulk.studyRequests);
    },
    canEdit() {
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return true;
      }
      if (this.studyRequestBulk !== null && this.hasAuthScope(AuthScope.STUDY_REQUESTS)) {
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
    selectedStudyRequests() {
      return this.selectedItems.map(({ studyRequest }) => studyRequest);
    },
    ...mapState(['locations']),
  },
  created() {
    this.setLocationsIndicesDeselected([]);
  },
  beforeDestroy() {
    this.setLocationsIndicesDeselected([]);
  },
  methods: {
    actionEdit() {
      const { id } = this.studyRequestBulk;
      const route = {
        name: 'requestStudyBulkEdit',
        params: { id },
      };
      this.$router.push(route);
    },
    async actionUpdateItem(item) {
      this.loadingItems = true;
      this.selectedItems = [];
      await this.saveStudyRequest(item.studyRequest);
      await this.loadAsyncForRoute(this.$route);
      this.loadingItems = false;
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

      const indicesDeselected = bulkIndicesDeselected(
        this.locations,
        this.studyRequestBulk.studyRequests,
      );
      this.setLocationsIndicesDeselected(indicesDeselected);

      const { user } = this.auth;
      this.studyRequestUsers.set(user.id, user);
      this.studyRequestUsers = studyRequestUsers;
    },
    async onUpdateStudyRequests() {
      this.loadingItems = true;
      this.selectedItems = [];
      await this.saveStudyRequestBulk(this.studyRequestBulk);
      await this.loadAsyncForRoute(this.$route);
      this.loadingItems = false;
    },
    ...mapMutations(['setLocationsIndicesDeselected']),
    ...mapActions(['initLocations', 'saveStudyRequest', 'saveStudyRequestBulk']),
  },
};
</script>

<style lang="scss">
.fc-request-study-bulk-view {
  max-height: var(--full-height);
  width: 100%;

  & .pane-map {
    min-height: 400px;
  }
}
</style>
