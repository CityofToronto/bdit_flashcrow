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

    <section class="flex-grow-1 flex-shrink-1 mt-4 mb-6 px-5">
      <v-card
        class="fc-requests-track-card d-flex flex-column fill-height"
        flat
        outlined>
        <v-card-title class="flex-grow-0 flex-shrink-0 py-2">
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

        <v-card-text
          class="fc-data-table-requests-wrapper flex-grow-1 flex-shrink-1 pa-0">
          <FcDataTableRequests
            v-model="selectedItems"
            aria-labelledby="heading_track_requests_requests"
            :columns="columns"
            :has-filters="hasFiltersRequest"
            :height="heightTable"
            :items="items"
            :items-per-page.sync="itemsPerPage"
            :loading="loading"
            :page.sync="page"
            :server-items-length="items.length"
            @update-item="actionUpdateItem" />
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions
          v-if="items.length > 0"
          class="flex-grow-0 flex-shrink-0">
          <v-spacer></v-spacer>
          <v-pagination
            v-model="page"
            :length="numPages"
            :total-visible="7" />
          <FcProgressCircular
            v-if="loadingTotal"
            aria-label="Loading total number of requests"
            small />
          <div v-else>
            {{pageFrom}}&ndash;{{pageTo}} of {{total}}
          </div>
        </v-card-actions>
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
import { debounce } from '@/lib/FunctionUtils';
import { getStudyRequestItems, getStudyRequestItemsTotal } from '@/lib/api/WebApi';
import {
  getStudyRequestItem,
  getStudyRequestBulkItem,
} from '@/lib/requests/RequestItems';
import RequestDataTableColumns from '@/lib/requests/RequestDataTableColumns';
import RequestItemExport from '@/lib/requests/RequestItemExport';
import { ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';
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
    FcProgressCircular,
    FcSearchBarRequests,
    FcStudyRequestFilters,
    FcStudyRequestFilterShortcuts,
  },
  data() {
    return {
      columns: RequestDataTableColumns,
      heightTable: 400,
      itemsPerPage: 25,
      loadingTotal: false,
      page: 1,
      selectedItems: [],
      studyRequestItems: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
      total: 0,
    };
  },
  computed: {
    filterParamsRequestWithPagination() {
      const limit = this.itemsPerPage;
      const offset = (this.page - 1) * this.itemsPerPage;
      return {
        ...this.filterParamsRequest,
        limit,
        offset,
      };
    },
    items() {
      return this.studyRequestItems.map(({ bulk, request }) => {
        if (bulk) {
          return getStudyRequestBulkItem(
            this.studyRequestLocations,
            this.studyRequestUsers,
            request,
          );
        }
        return getStudyRequestItem(
          this.studyRequestLocations,
          this.studyRequestUsers,
          request,
        );
      });
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
    numPages() {
      return Math.ceil(this.total / this.itemsPerPage);
    },
    pageFrom() {
      return (this.page - 1) * this.itemsPerPage + 1;
    },
    pageTo() {
      return Math.min(this.total, this.page * this.itemsPerPage);
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
    studyRequestsBulk() {
      return this.studyRequestItems
        .filter(({ bulk }) => bulk)
        .map(({ request }) => request);
    },
    ...mapGetters('trackRequests', ['filterParamsRequest', 'hasFiltersRequest']),
    ...mapState(['auth']),
    ...mapState('trackRequests', ['filtersRequest', 'searchRequest']),
  },
  watch: {
    filterParamsRequest: {
      deep: true,
      handler: debounce(async function updateTotal() {
        this.loadingTotal = true;

        const total = await getStudyRequestItemsTotal(this.filterParamsRequestWithPagination);

        this.page = 1;
        this.total = total;

        this.loadingTotal = false;
      }, 500),
    },
    filterParamsRequestWithPagination: debounce(async function updateItems() {
      this.loading = true;

      const {
        studyRequestItems,
        studyRequestLocations,
        studyRequestUsers,
      } = await getStudyRequestItems(this.filterParamsRequestWithPagination);

      this.studyRequestItems = studyRequestItems;
      this.studyRequestLocations = studyRequestLocations;
      this.studyRequestUsers = studyRequestUsers;

      this.selectedItems = [];

      this.loading = false;
    }, 200),
  },
  created() {
    const userOnly = !this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN);
    this.setFiltersRequestUserOnly(userOnly);
  },
  mounted() {
    const $tableWrapper = this.$el.querySelector('.fc-data-table-requests-wrapper');
    this.heightTable = $tableWrapper.clientHeight - 56;
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
        studyRequestItems,
        studyRequestLocations,
        studyRequestUsers,
      } = await getStudyRequestItems(this.filterParamsRequestWithPagination);
      const total = await getStudyRequestItemsTotal(this.filterParamsRequestWithPagination);

      this.studyRequestItems = studyRequestItems;
      this.studyRequestLocations = studyRequestLocations;
      this.studyRequestUsers = studyRequestUsers;
      this.total = total;
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
