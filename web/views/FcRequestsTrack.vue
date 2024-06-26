<template>
  <section
    aria-labelledby="heading_track_requests_requests"
    class="fc-requests-track d-flex flex-column fill-height">
    <FcDialogProjectMode
      v-model="showDialogProjectMode"
      :project-mode="projectMode"
      :study-requests="selectedStudyRequests"
      @action-save="actionSaveProjectMode" />

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
              class="mt-0 mr-2 pt-0"
              hide-details
              :indeterminate="selectAll === null">
              <template v-slot:label>
                <span>Select all</span>
                <FcTextNumberTotal
                  class="ml-2"
                  :k="selectedItems.length"
                  :n="itemsStudyRequest.length" />
              </template>
            </v-checkbox>
            <Login ref="login" />
            <FcMenuDownloadTrackRequests
              :loading="loadingDownload"
              :selected-items="selectedItems"
              type="secondary"
              @action-download="actionDownload" />
            <div class="set-status-dropdown">
              <SetStatusDropdownForBulk
                v-if="userIsStudyRequestAdmin"
                :study-requests="selectedStudyRequests"
                @transition-status="updateSelectedRequestsStatus"
              />
            </div>
            <FcMenuStudyRequestsProjectMode
              button-class="ml-2"
              :disabled="selectAll === false"
              label="Create Project"
              text-inject="selection"
              @action-project-mode="actionSetProjectMode" />

            <FcStudyRequestFilters
              class="ml-2"
              :items="items" />
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
            height="calc(100vh - 320px)"
            :items="items"
            :items-per-page.sync="itemsPerPage"
            :loading="loading"
            :page.sync="page"
            @update-item="actionUpdateItem" />
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions
          v-if="items.length > 0"
          class="flex-grow-0 flex-shrink-0">
          <v-spacer></v-spacer>

          <FcProgressCircular
            v-if="loadingTotal"
            aria-label="Loading total number of requests"
            small />
          <div v-else>
            {{pageFrom}}&ndash;{{pageTo}} of {{total}}
          </div>

          <v-pagination
            v-model="page"
            :length="numPages"
            :total-visible="7" />
        </v-card-actions>
      </v-card>
    </section>
  </section>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { Ripple } from 'vuetify/lib/directives';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  AuthScope,
  ProjectMode,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import {
  getReportDownload,
  getStudyRequestItems,
  getStudyRequestItemsTotal,
} from '@/lib/api/WebApi';
import {
  getStudyRequestItem,
  getStudyRequestBulkItem,
} from '@/lib/requests/RequestItems';
import RequestDataTableColumns from '@/lib/requests/RequestDataTableColumns';
import { ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import Login from '@/web/components/Login.vue';
import FcDataTableRequests from '@/web/components/FcDataTableRequests.vue';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcDialogProjectMode from '@/web/components/dialogs/FcDialogProjectMode.vue';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';
import FcSearchBarRequests from '@/web/components/inputs/FcSearchBarRequests.vue';
import FcStudyRequestFilters from '@/web/components/requests/FcStudyRequestFilters.vue';
import FcStudyRequestFilterShortcuts
  from '@/web/components/requests/FcStudyRequestFilterShortcuts.vue';
import FcMenuDownloadTrackRequests
  from '@/web/components/requests/download/FcMenuDownloadTrackRequests.vue';
import SetStatusDropdownForBulk from '@/web/components/requests/status/SetStatusDropdownForBulk.vue';
import FcMenuStudyRequestsProjectMode
  from '@/web/components/requests/status/FcMenuStudyRequestsProjectMode.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcRequestsTrack',
  mixins: [FcMixinAuthScope],
  directives: {
    Ripple,
  },
  components: {
    Login,
    FcDataTableRequests,
    FcDialogProjectMode,
    FcMenuDownloadTrackRequests,
    FcMenuStudyRequestsProjectMode,
    SetStatusDropdownForBulk,
    FcProgressCircular,
    FcSearchBarRequests,
    FcStudyRequestFilters,
    FcStudyRequestFilterShortcuts,
    FcTextNumberTotal,
  },
  data() {
    return {
      columns: RequestDataTableColumns,
      itemsPerPage: 25,
      loading: true,
      loadingDownload: false,
      loadingTotal: false,
      page: this.getPageNum(),
      projectMode: ProjectMode.NONE,
      selectedItems: [],
      showDialogProjectMode: false,
      studyRequestItems: [],
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
      studyRequestComments: new Map(),
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
            this.studyRequestComments,
          );
        }
        return getStudyRequestItem(
          this.studyRequestLocations,
          this.studyRequestUsers,
          request,
          this.studyRequestComments,
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
      if (this.total === 0) {
        return 0;
      }
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
    userIsStudyRequestAdmin() {
      return this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN);
    },
    ...mapGetters('trackRequests', ['filterParamsRequest', 'hasFiltersRequest']),
    ...mapState(['auth']),
    ...mapState('trackRequests', ['filtersRequest', 'searchRequest']),
  },
  watch: {
    filterParamsRequest: {
      deep: true,
      handler: debounce(async function updateTotal(newValue, oldValue) {
        this.loadingTotal = true;

        const total = await getStudyRequestItemsTotal(this.filterParamsRequestWithPagination);

        // Following logic only remembers the page number if the user is navigating between pages
        // without refreshing (i.e oldValue === undefined)

        if (!oldValue) {
          this.page = this.getPageNum();
        } else {
          this.page = 1;
        }

        this.total = total;

        this.loadingTotal = false;
      }, 500),
      immediate: true,
    },
    filterParamsRequestWithPagination: {
      handler: debounce(async function updateItems() {
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
      immediate: true,
    },
    page() {
      this.setPageNum(this.page);
    },
  },
  created() {
    const userOnly = !this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN);
    this.setFiltersRequestUserOnly(userOnly);
  },
  methods: {
    async actionDownload(selectedOnly) {
      const { loggedIn } = await this.checkAuth();
      if (loggedIn) {
        this.loadingDownload = true;
        if (selectedOnly) {
          await this.actionDownloadSelected();
        } else {
          await this.actionDownloadAll();
        }
        this.loadingDownload = false;
      } else {
        this.$refs.login.actionSignIn();
      }
    },
    async actionDownloadAll() {
      const id = uuidv4();
      getReportDownload(
        ReportType.TRACK_REQUESTS,
        id,
        ReportFormat.CSV,
        this.filterParamsRequestWithPagination,
      );
    },
    async actionDownloadSelected() {
      /*
       * When downloading selected study requests only, we pass in a comma-separated
       * list of study request IDs.
       */
      const id = this.selectedItems
        .map(item => item.studyRequest.id)
        .join(',');
      getReportDownload(
        ReportType.TRACK_REQUESTS_SELECTED,
        id,
        ReportFormat.CSV,
        {},
      );
    },
    async actionSaveProjectMode(studyRequestBulk) {
      const { projectMode, studyRequestLocations } = this;
      const studyRequests = this.selectedStudyRequests;
      this.selectedItems = [];
      await this.updateStudyRequestsBulkRequests({
        projectMode,
        studyRequests,
        studyRequestBulk,
        studyRequestLocations,
      });
      await this.loadAsync();
    },
    actionSetProjectMode(projectMode) {
      this.projectMode = projectMode;
      this.showDialogProjectMode = true;
    },
    async actionUpdateItem(item) {
      this.selectedItems = [];
      await this.saveStudyRequest(item.studyRequest);
      await this.loadAsync();
    },
    async loadAsync() {
      this.loading = true;

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

      this.loading = false;
    },
    async updateSelectedRequestsStatus(nextStatus) {
      const selectedRequests = this.selectedStudyRequests;
      const nSelected = selectedRequests.length;
      selectedRequests.forEach((sr) => {
        // eslint-disable-next-line no-param-reassign
        sr.status = nextStatus;
      });
      this.selectedItems = [];
      await this.updateStudyRequests(selectedRequests);
      if (nSelected > 1) {
        this.setToastInfo(`${nSelected} requests set to "${nextStatus.text}"`);
      } else if (nSelected === 1) {
        this.setToastInfo(`Request #${selectedRequests[0].id} set to "${nextStatus.text}"`);
      }
      await this.loadAsync();
    },
    filtersExist() {
      return Object.keys(this.filterParamsRequest).length > 2;
    },
    ...mapMutations('trackRequests', ['setFiltersRequestUserOnly', 'setPageNum']),
    ...mapMutations(['setToastInfo', 'setDialog']),
    ...mapActions(['saveStudyRequest', 'updateStudyRequests', 'checkAuth']),
    ...mapActions('editRequests', ['updateStudyRequestsBulkRequests']),
    ...mapGetters('trackRequests', ['getPageNum']),
  },
};
</script>

<style lang="scss">
.fc-requests-track {
  background-color: var(--v-shading-base);
  max-height: var(--full-height);
  width: 100%;

  .set-status-dropdown {
    padding-left: 8px;
  }

  & .fc-requests-track-card {
    height: calc(100% - 4px);
  }

  & .fc-requests-track-table-title {
    width: 100%;
  }
}
</style>
