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
        </v-row>

        <v-divider></v-divider>

        <v-container fluid>
          <v-row>
            <h3 class="display-2 mt-6 mb-2 mx-5" id="heading_bulk_request_requests">
              <span>Requests</span>
            </h3>
          </v-row>
          <v-row class="d-flex flex-row">
            <v-col cols="8" class="flex-1 pl-5">
              <v-card dense outlined class="flex-grow-1 fill-height">
                <section
                  aria-labelledby="heading_bulk_request_requests"
                  class="mb-0 mx-0 py-0">
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

                    <template>
                      <SetStatusDropdownForBulk
                        v-if="userIsStudyRequestAdmin"
                        :study-requests="selectedStudyRequests"
                        @transition-status="updateSelectedRequestsStatus" />
                      <CancelRequestButton
                        v-else-if="userIsStudyRequester"
                        :disabled="noRequestsSelected || userCannotCancelAllSelectedRequests"
                        :nRequests="selectedRequestsCount"
                        :projectContext="true"
                        @cancel-request="cancelSelected">
                      </CancelRequestButton>
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
                    fixed-header
                    height="400px"
                    calculate-widths
                    :has-filters="false"
                    :items="items"
                    :loading="loadingItems"
                    @update-item="actionUpdateItem" />
                </section>
              </v-card>
            </v-col>

            <v-col cols="4" class="flex-1 px-5 pl-0">
              <FcMap
                class="mx-0 fill-height"
                :locations-state="locationsState"
                :show-legend="false"
                :is-request-page="true"/>
            </v-col>
          </v-row>
        </v-container>

      </section>
    </div>
  </div>
</template>

<script>
import { Ripple } from 'vuetify/lib/directives';
import { mapActions, mapMutations } from 'vuex';

import { centrelineKey, ProjectMode, StudyRequestStatus } from '@/lib/Constants';
import { getStudyRequestBulk } from '@/lib/api/WebApi';
import { getStudyRequestInfo, groupRequestsByLocation } from '@/lib/geo/CentrelineUtils';
import { getStudyRequestItem } from '@/lib/requests/RequestItems';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcMap from '@/web/components/geo/map/FcMap.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import SetStatusDropdownForBulk from '@/web/components/requests/status/SetStatusDropdownForBulk.vue';
import FcStatusStudyRequests from '@/web/components/requests/status/FcStatusStudyRequests.vue';
import FcSummaryStudyRequestBulk
  from '@/web/components/requests/summary/FcSummaryStudyRequestBulk.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import CancelRequestButton from '@/web/components/requests/status/CancelRequestButton.vue';
import SrStatusTransitionValidator from '@/lib/SrStatusTransitionValidator';

export default {
  name: 'FcRequestStudyBulkView',
  mixins: [
    FcMixinRouteAsync,
    FcMixinAuthScope,
  ],
  directives: {
    Ripple,
  },
  components: {
    FcButton,
    FcDataTableRequests,
    FcMap,
    SetStatusDropdownForBulk,
    FcNavStudyRequest,
    FcProgressLinear,
    FcStatusStudyRequests,
    FcSummaryStudyRequestBulk,
    FcTextNumberTotal,
    CancelRequestButton,
  },
  data() {
    return {
      columns: [
        { value: 'SELECT', text: '' },
        { value: 'ID', text: 'ID' },
        { value: 'LOCATION', text: 'Location' },
        { value: 'data-table-expand', text: '' },
        { value: 'STUDY_TYPE', text: 'Type' },
        { value: 'REQUESTER', text: 'Requester' },
        { value: 'STATUS', text: 'Status' },
        { value: 'ACTIONS', text: '' },
      ],
      loadingItems: false,
      selectedItems: [],
      studyRequestBulk: null,
      studyRequestChanges: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
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
        location = getStudyRequestInfo(studyRequest, location);
        const state = {
          deselected: false,
          locationIndex: -1,
          multi: false,
          selected: false,
        };
        locationsState.push({ location, state });
      });
      return groupRequestsByLocation(locationsState);
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
    userIsStudyRequestAdmin() {
      return this.hasAuthScope(this.AuthScope.STUDY_REQUESTS_ADMIN);
    },
    userIsStudyRequester() {
      return this.studyRequesterUserIds.includes(this.auth.user.id);
    },
    transitionValidator() {
      return new SrStatusTransitionValidator(this.auth.user.scope);
    },
    areSelectedRequestsCancellable() {
      let cancellableRequests = [];
      if (this.userIsStudyRequestAdmin) {
        cancellableRequests = Array(this.selectedRequestsCount).fill(true);
      } else {
        cancellableRequests = this.selectedItems.map((request) => {
          const isUsersRequest = request.requestedBy.id === this.auth.user.id;
          const isValidTransition = this.transitionValidator.isValidTransition(
            request.status, this.cancelledStatus,
          );
          return isUsersRequest && isValidTransition;
        });
      }
      return cancellableRequests;
    },
    userCannotCancelAllSelectedRequests() {
      return this.areSelectedRequestsCancellable.includes(false);
    },
    cancelledStatus() {
      return StudyRequestStatus.CANCELLED;
    },
    noRequestsSelected() {
      return this.selectedRequestsCount === 0;
    },
    selectedRequestsCount() {
      return this.selectedStudyRequests.length;
    },
    selectedRequestIds() {
      return this.selectedStudyRequests.map(sr => sr.id);
    },
    studyRequesterUserIds() {
      const ids = [];
      this.studyRequestUsers.forEach(user => ids.push(user.id));
      return ids;
    },
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
        studyRequestLocations: this.studyRequestLocations,
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
    async updateSelectedRequestsStatus(nextStatus) {
      const nSelected = this.selectedRequestsCount;
      this.selectedStudyRequests.forEach((sr) => {
        // eslint-disable-next-line no-param-reassign
        sr.status = nextStatus;
      });
      this.loadingItems = true;
      await this.saveStudyRequestBulk(this.studyRequestBulk);
      if (nSelected > 1) {
        this.setToastInfo(`${nSelected} requests set to "${nextStatus.text}"`);
      } else {
        this.setToastInfo(`Request #${this.selectedStudyRequests[0].id} set to "${nextStatus.text}"`);
      }
      this.reloadPage();
    },
    async cancelSelected() {
      this.loadingItems = true;
      const updatePromises = [];
      this.studyRequestBulk.studyRequests.forEach((request) => {
        if (this.selectedRequestIds.includes(request.id)) {
          // eslint-disable-next-line no-param-reassign
          request.status = this.cancelledStatus;
          updatePromises.push(this.saveStudyRequest(request));
        }
      });
      Promise.all(updatePromises).then((responses) => {
        const n = this.selectedRequestsCount;
        const s = n === 1 ? '' : 's';
        this.setToastInfo(`${n} request${s} cancelled`);
        this.reloadPage();
        return responses;
      });
    },
    async reloadPage() {
      await this.loadAsyncForRoute(this.$route);
      this.selectedItems = [];
      this.loadingItems = false;
    },
    ...mapActions(['saveStudyRequest', 'saveStudyRequestBulk']),
    ...mapActions('editRequests', ['updateStudyRequestsBulkRequests']),
    ...mapMutations(['setToastInfo', 'setDialog']),
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
