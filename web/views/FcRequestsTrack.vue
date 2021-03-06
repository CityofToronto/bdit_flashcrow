<template>
  <section
    aria-labelledby="heading_track_requests_requests"
    class="fc-requests-track d-flex flex-column fill-height">
    <div class="flex-grow-0 flex-shrink-0 px-5">
      <h2 class="display-3 mt-6" id="heading_track_requests_requests">
        Requests
      </h2>
      <div class="align-center d-flex mt-6">
        <FcStudyRequestFilterShortcuts />

        <v-spacer></v-spacer>

        <FcSearchBarRequests :columns="columns" />
      </div>
    </div>

    <section class="flex-grow-1 flex-shrink-1 mt-4 mb-6 overflow-y-auto px-5">
      <v-card
        class="fc-requests-track-card"
        flat
        outlined>
        <v-card-title class="py-2">
          <nav
            aria-label="Filtering and selection tools for requests"
            class="fc-requests-track-table-title align-center d-flex">

            <v-checkbox
              v-model="selectAll"
              class="mt-0 mr-6 pt-0"
              hide-details
              :indeterminate="selectAll === null"
              label="Select all" />

            <FcStudyRequestFilters :items="items" />

            <v-spacer></v-spacer>

            <FcButton
              class="ml-2"
              :disabled="selectAll === false"
              type="secondary"
              @click="actionDownload(selectedItems)">
              <v-icon color="primary" left>mdi-cloud-download</v-icon>
              Download
              <span class="sr-only">Requests</span>
            </FcButton>
            <template v-if="hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)">
              <FcMenuStudyRequestsStatus
                button-class="ml-2"
                :disabled="selectAll === false"
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
          </nav>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="fc-data-table-requests-wrapper overflow-y-hidden pa-0">
          <FcDataTableRequests
            v-model="selectedItems"
            aria-labelledby="heading_track_requests_requests"
            :columns="columns"
            :has-filters="hasFiltersRequest"
            :items="items"
            :loading="loading"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            @update-item="actionUpdateItem" />
        </v-card-text>
      </v-card>
    </section>
  </section>
</template>

<script>
import { saveAs } from 'file-saver';
import { Ripple } from 'vuetify/lib/directives';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import { AuthScope } from '@/lib/Constants';
import { getStudyRequests } from '@/lib/api/WebApi';
import { filterItem } from '@/lib/requests/RequestFilters';
import {
  getStudyRequestItem,
  getStudyRequestBulkItem,
} from '@/lib/requests/RequestItems';
import RequestDataTableColumns from '@/lib/requests/RequestDataTableColumns';
import RequestItemExport from '@/lib/requests/RequestItemExport';
import { ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcSearchBarRequests from '@/web/components/inputs/FcSearchBarRequests.vue';
import FcStudyRequestFilters from '@/web/components/requests/FcStudyRequestFilters.vue';
import FcStudyRequestFilterShortcuts
  from '@/web/components/requests/FcStudyRequestFilterShortcuts.vue';
import FcMenuStudyRequestsAssignTo
  from '@/web/components/requests/status/FcMenuStudyRequestsAssignTo.vue';
import FcMenuStudyRequestsStatus
  from '@/web/components/requests/status/FcMenuStudyRequestsStatus.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcRequestsTrack',
  mixins: [
    FcMixinAuthScope,
    FcMixinRouteAsync,
  ],
  directives: {
    Ripple,
  },
  components: {
    FcButton,
    FcDataTableRequests,
    FcMenuStudyRequestsAssignTo,
    FcMenuStudyRequestsStatus,
    FcSearchBarRequests,
    FcStudyRequestFilters,
    FcStudyRequestFilterShortcuts,
  },
  data() {
    return {
      columns: RequestDataTableColumns,
      selectedItems: [],
      sortBy: 'DUE_DATE',
      sortDesc: true,
      studyRequests: [],
      studyRequestsBulk: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    items() {
      return this.itemsNormalized
        .map(item => filterItem(
          this.filtersRequest,
          this.searchRequest,
          this.auth.user,
          item,
        ))
        .filter(item => item !== null);
    },
    itemsNormalized() {
      const itemsStudyRequests = this.studyRequests.map(
        studyRequest => getStudyRequestItem(
          this.studyRequestLocations,
          this.studyRequestUsers,
          studyRequest,
        ),
      );
      const itemsStudyRequestsBulk = this.studyRequestsBulk.map(
        studyRequestBulk => getStudyRequestBulkItem(
          this.studyRequestLocations,
          this.studyRequestUsers,
          studyRequestBulk,
        ),
      );
      return [
        ...itemsStudyRequests,
        ...itemsStudyRequestsBulk,
      ];
    },
    itemsStudyRequest() {
      const itemsAll = [];
      this.items.forEach((item) => {
        if (item.type === ItemType.STUDY_REQUEST) {
          itemsAll.push(item);
        } else {
          item.studyRequestBulk.studyRequests.forEach((subitem) => {
            itemsAll.push(subitem);
          });
        }
      });
      return itemsAll;
    },
    selectAll: {
      get() {
        const k = this.selectedItems.length;
        if (k === 0) {
          return false;
        }
        if (k === this.itemsStudyRequest.length) {
          return true;
        }
        return null;
      },
      set(selectAll) {
        if (selectAll) {
          this.selectedItems = this.itemsStudyRequest;
        } else {
          this.selectedItems = [];
        }
      },
    },
    selectedStudyRequests() {
      return this.selectedItems.map(({ studyRequest }) => studyRequest);
    },
    ...mapGetters('trackRequests', ['hasFiltersRequest']),
    ...mapState(['auth']),
    ...mapState('trackRequests', ['filtersRequest', 'searchRequest']),
  },
  created() {
    const userOnly = !this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN);
    this.setFiltersRequestUserOnly(userOnly);
  },
  methods: {
    actionDownload(items) {
      const csvStr = RequestItemExport.get(items, this.studyRequestsBulk);
      const csvData = new Blob([csvStr], { type: 'text/csv' });
      saveAs(csvData, 'requests.csv');
    },
    async actionUpdateItem(item) {
      this.loading = true;
      this.selectedItems = [];
      await this.saveStudyRequest(item.studyRequest);
      await this.loadAsyncForRoute(this.$route);
      this.loading = false;
    },
    async loadAsyncForRoute() {
      const {
        studyRequests,
        studyRequestsBulk,
        studyRequestLocations,
        studyRequestUsers,
      } = await getStudyRequests();

      this.studyRequests = studyRequests;
      this.studyRequestsBulk = studyRequestsBulk;
      this.studyRequestLocations = studyRequestLocations;
      this.studyRequestUsers = studyRequestUsers;
    },
    async onUpdateStudyRequests() {
      this.loading = true;
      const studyRequests = this.selectedStudyRequests;
      this.selectedItems = [];
      await this.updateStudyRequests(studyRequests);
      await this.loadAsyncForRoute(this.$route);
      this.loading = false;
    },
    ...mapMutations('trackRequests', ['setFiltersRequestUserOnly']),
    ...mapActions(['saveStudyRequest', 'updateStudyRequests']),
  },
};
</script>

<style lang="scss">
.fc-requests-track {
  background-color: var(--v-shading-base);
  max-height: var(--full-height);
  width: 100%;

  & .fc-requests-track-card {
    height: calc(100% - 4px);
  }

  & .fc-requests-track-table-title {
    width: 100%;
  }

  & .fc-data-table-requests-wrapper {
    height: calc(100% - 53px);
    & > .fc-data-table-requests {
      height: calc(100% - 1px);
    }
  }
}
</style>
