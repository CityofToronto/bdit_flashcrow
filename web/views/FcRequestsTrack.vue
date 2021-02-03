<template>
  <section class="fc-requests-track d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-divider></v-divider>
      <div class="px-5">
        <div class="align-center d-flex mt-6">
          <FcStudyRequestFilterShortcuts
            v-model="filters" />

          <v-spacer></v-spacer>

          <FcSearchBarRequests
            v-model="search"
            :columns="columns" />
        </div>
      </div>
    </header>

    <section class="flex-grow-1 flex-shrink-1 mt-6 mb-8 overflow-y-auto px-5">
      <v-card class="fc-requests-track-card">
        <v-card-title class="py-2">
          <nav
            aria-label="Filtering and selection tools for requests"
            class="fc-requests-track-table-title align-center d-flex">

            <v-tooltip right>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-checkbox
                    v-model="selectAll"
                    aria-label="Select all"
                    class="mt-0 mr-3 pt-0"
                    hide-details
                    :indeterminate="selectAll === null"/>
                </div>
              </template>
              <span>Select all</span>
            </v-tooltip>

            <FcButton
              class="mr-2"
              :disabled="selectAll === false"
              type="secondary"
              @click="actionDownload(selectedItems)">
              <v-icon color="primary" left>mdi-cloud-download</v-icon>
              Download
            </FcButton>
            <template v-if="hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)">
              <FcMenuStudyRequestsStatus
                button-class="mr-2"
                :disabled="selectAll === false"
                :study-requests="selectedStudyRequests"
                @update="onUpdateStudyRequests" />

              <FcMenuStudyRequestsAssignTo
                button-class="mr-2"
                :disabled="selectAll === false"
                :study-requests="selectedStudyRequests"
                @update="onUpdateStudyRequests" />
            </template>

            <FcStudyRequestFilters
              v-model="filters"
              :items="items" />

            <v-spacer></v-spacer>

            <FcButton
              class="mr-2"
              :loading="loading"
              type="secondary"
              @click="actionRefresh()">
              <v-icon
                color="primary"
                left>mdi-refresh</v-icon>
              Refresh
            </FcButton>
          </nav>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="fc-data-table-requests-wrapper overflow-y-hidden pa-0">
          <FcDataTableRequests
            v-model="selectedItems"
            :columns="columns"
            :has-filters="hasFilters"
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
import { mapActions, mapState } from 'vuex';

import { AuthScope } from '@/lib/Constants';
import { getStudyRequests } from '@/lib/api/WebApi';
import { filterItem, getFilterChips } from '@/lib/requests/RequestFilters';
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
      filters: {
        assignees: [],
        closed: false,
        createdAt: 0,
        lastEditedAt: 0,
        statuses: [],
        studyTypes: [],
        userOnly: false,
      },
      search: {
        column: null,
        query: null,
      },
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
    hasFilters() {
      const filterChips = getFilterChips(this.filters, this.items);
      return filterChips.length > 0 || this.search.query !== null;
    },
    items() {
      return this.itemsNormalized
        .map(item => filterItem(this.filters, this.search, this.auth.user, item))
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
    ...mapState(['auth']),
  },
  created() {
    const userOnly = !this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN);
    this.filters.userOnly = userOnly;
  },
  methods: {
    actionDownload(items) {
      const csvStr = RequestItemExport.get(items, this.studyRequestsBulk);
      const csvData = new Blob([csvStr], { type: 'text/csv' });
      saveAs(csvData, 'requests.csv');
    },
    async actionRefresh() {
      this.loading = true;
      await this.loadAsyncForRoute();
      this.loading = false;
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
