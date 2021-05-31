<template>
  <div class="fc-request-study-bulk-view d-flex flex-column fill-height">
    <FcNavStudyRequest
      :study-request="studyRequestBulk" />

    <v-divider></v-divider>

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <FcProgressLinear
        v-if="loading"
        aria-label="Loading bulk study request" />
      <section
        v-else
        aria-labelledby="heading_bulk_request_details">
        <v-row
          class="mb-6"
          no-gutters>
          <v-col class="mt-6 px-5" cols="12">
            <h3 class="display-2 mb-4" id="heading_bulk_request_details">
              Request Details
            </h3>

            <div class="pt-2 pb-4">
              <div class="subtitle-1 pb-2">Status</div>
              <FcStatusStudyRequests
                class="mt-2 mb-4"
                :created-at="studyRequestBulk.createdAt"
                :study-requests="studyRequestBulk.studyRequests"
                :study-request-changes="studyRequestChanges" />
            </div>
          </v-col>
          <v-col cols="6">
            <FcSummaryStudyRequestBulk
              class="mx-5"
              :study-request-bulk="studyRequestBulk" />
          </v-col>
          <v-col cols="6">
            <FcMap
              class="mx-5"
              :layers="{
                collisions: false,
                hospitals: false,
                schools: false,
                studies: true,
                volume: false,
              }"
              :locations-state="locationsState"
              :show-legend="false" />
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <section
          aria-labelledby="heading_bulk_request_requests"
          class="mb-6 mx-5">
          <h3 class="display-2 mt-6 mb-2" id="heading_bulk_request_requests">
            <span>Requests</span>
          </h3>
          <div class="align-center d-flex px-4 py-2">
            <v-checkbox
              v-model="selectAll"
              class="mt-0 mr-2 pt-0"
              hide-details
              :indeterminate="selectAll === null">
              <template v-slot:label>
                <span class="font-weight-medium">Select all</span>
                <FcTextNumberTotal
                  class="ml-2"
                  :k="selectedItems.length"
                  :n="items.length" />
              </template>
            </v-checkbox>

            <template v-if="canEdit">
              <FcMenuStudyRequestsStatus
                button-class="ml-2"
                :disabled="selectAll === false"
                :status="bulkStatus"
                :study-requests="selectedStudyRequests"
                text-screen-reader="Selected Requests"
                @update="onUpdateStudyRequests" />
            </template>

            <FcButton
              class="ml-2"
              :disabled="selectAll === false"
              type="secondary"
              @click="actionRemoveFromProject">
              <v-icon left>mdi-folder-remove</v-icon>
              Remove From Project
            </FcButton>
          </div>

          <v-divider></v-divider>

          <FcDataTableRequests
            v-model="selectedItems"
            aria-labelledby="heading_bulk_request_requests"
            :columns="columns"
            disable-pagination
            disable-sort
            :has-filters="false"
            :items="items"
            :loading="loadingItems"
            @update-item="actionUpdateItem" />
        </section>
      </section>
    </div>
  </div>
</template>

<script>
import { Ripple } from 'vuetify/lib/directives';
import { mapActions, mapState } from 'vuex';

import { centrelineKey, ProjectMode } from '@/lib/Constants';
import { getStudyRequestBulk } from '@/lib/api/WebApi';
import { getStudyRequestLocation } from '@/lib/geo/CentrelineUtils';
import RequestActions from '@/lib/requests/RequestActions';
import { getStudyRequestItem } from '@/lib/requests/RequestItems';
import RequestDataTableColumns from '@/lib/requests/RequestDataTableColumns';
import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcMap from '@/web/components/geo/map/FcMap.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMenuStudyRequestsStatus
  from '@/web/components/requests/status/FcMenuStudyRequestsStatus.vue';
import FcStatusStudyRequests from '@/web/components/requests/status/FcStatusStudyRequests.vue';
import FcSummaryStudyRequestBulk
  from '@/web/components/requests/summary/FcSummaryStudyRequestBulk.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcRequestStudyBulkView',
  mixins: [FcMixinRouteAsync],
  directives: {
    Ripple,
  },
  components: {
    FcButton,
    FcDataTableRequests,
    FcMap,
    FcMenuStudyRequestsStatus,
    FcNavStudyRequest,
    FcProgressLinear,
    FcStatusStudyRequests,
    FcSummaryStudyRequestBulk,
    FcTextNumberTotal,
  },
  data() {
    return {
      columns: RequestDataTableColumns,
      loadingItems: false,
      selectedItems: [],
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
      return RequestActions.canEdit(this.auth.user, this.studyRequestBulk);
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
    locationsState() {
      if (this.studyRequestBulk === null) {
        return [];
      }
      const locationsState = [];
      this.studyRequestBulk.studyRequests.forEach((studyRequest) => {
        const key = centrelineKey(studyRequest);
        let location = null;
        if (this.studyRequestLocations.has(key)) {
          location = this.studyRequestLocations.get(key);
        }
        location = getStudyRequestLocation(studyRequest, location);
        const state = {
          deselected: false,
          locationIndex: -1,
          multi: false,
          selected: false,
        };
        locationsState.push({ location, state });
      });
      return locationsState;
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
    ...mapState(['auth']),
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
    async actionRemoveFromProject() {
      this.loading = true;
      const studyRequests = this.selectedStudyRequests;
      this.selectedItems = [];
      await this.updateStudyRequestsBulkRequests({
        projectMode: ProjectMode.NONE,
        studyRequests,
        studyRequestBulk: null,
      });
      await this.loadAsyncForRoute(this.$route);
      this.loading = false;
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

      this.studyRequestBulk = studyRequestBulk;
      this.studyRequestChanges = studyRequestChanges;
      this.studyRequestLocations = studyRequestLocations;

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
    ...mapActions(['saveStudyRequest', 'saveStudyRequestBulk']),
    ...mapActions('editRequests', ['updateStudyRequestsBulkRequests']),
  },
};
</script>

<style lang="scss">
.fc-request-study-bulk-view {
  max-height: var(--full-height);
  width: 100%;

  & .fc-map {
    min-height: 400px;
  }
}
</style>
