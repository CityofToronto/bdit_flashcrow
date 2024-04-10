<template>
  <div class="fc-drawer-view-collision-reports d-flex flex-column">
    <FcDialogConfirm
      v-model="showConfirmLeave"
      textCancel="Stay on this page"
      textOk="Leave"
      title="Leave Reports"
      @action-ok="actionLeave">
      <span class="body-1">
        Leaving this page will cause you to switch to another location.
        Are you sure you want to leave?
      </span>
    </FcDialogConfirm>
    <FcProgressLinear
      v-if="loading"
      aria-label="Loading collision reports viewer" />
    <template v-else>
      <div>
        <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 pt-2">
          <FcButton
            type="primary"
            @click="actionNavigateBack">
            <v-icon left>mdi-chevron-left</v-icon>
            View Data
          </FcButton>
          <h2 class="ml-4">
            <span class="headline">Collisions</span>
            <span class="font-weight-light headline secondary--text">
              &#x2022;
              <span v-if="locationMode === LocationMode.SINGLE || detailView">
                {{locationActive.description}}
              </span>
              <span v-else>
                {{locationsDescription}}
              </span>
            </span>
          </h2>

          <v-spacer></v-spacer>

          <v-menu
            v-if="locationMode !== LocationMode.SINGLE && detailView"
            max-height="320">
            <template v-slot:activator="{ on, attrs }">
              <FcButton
                v-bind="attrs"
                v-on="on"
                class="flex-grow-0 mt-0 ml-2"
                type="secondary">
                <FcIconLocationMulti v-bind="locationsIconProps[locationsIndex]" />
                <span class="pl-2">{{locationActive.description}}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </FcButton>
            </template>
            <FcListLocationMulti
              :disabled="disabledPerLocation"
              icon-classes="mr-2"
              :locations="locations"
              :locations-selection="locationsSelection"
              @click-location="setLocationsIndex" />
          </v-menu>
        </div>

        <div class="align-center d-flex">
          <nav>
            <v-tabs v-model="indexActiveReportType" show-arrows>
              <v-tab
                v-for="reportType in reportTypes"
                :key="reportType.name">
                {{reportType.label}}
              </v-tab>
            </v-tabs>
          </nav>

          <v-spacer></v-spacer>

          <template v-if="!loadingReportLayout">
            <div v-if="isDirectoryReport && userLoggedIn
              && userHasMvcrReadPermission && mvcrCount > 0">
              <FcButton
                @click="downloadAllMvcrs"
                class="ml-2"
                :type="'secondary'">
                  <span>Export {{ mvcrCount }} MVCR</span>
              </FcButton>
            </div>
          </template>

          <div class="mr-3">
            <FcMenuDownloadReportFormat
              :loading="loadingDownload"
              :report-type="activeReportType"
              text-screen-reader="Collision Report"
              type="secondary"
              @download-report-format="actionDownload" />
          </div>
        </div>

        <v-divider></v-divider>
      </div>

      <section class="flex-grow-1 flex-shrink-1 overflow-y-auto pt-2">
        <div
          v-if="loadingReportLayout"
          class="ma-3 text-center">
          <FcProgressCircular
            aria-label="Loading selected report"
            class="ma-3" />
          <div class="font-weight-regular headline secondary--text">
            This page is loading, please wait.
          </div>
        </div>
        <div
          v-else
          class="fc-report-wrapper pa-3">
          <FcReport v-bind="reportLayout" />
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  LocationMode,
  LocationSelectionType,
  ReportFormat,
  ReportType,
  AuthScope,
} from '@/lib/Constants';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import {
  getCollisionsByCentrelineSummaryPerLocation,
  getReportDownload,
  getReportWeb,
  postJobCompressMvcrs,
} from '@/lib/api/WebApi';
import { defaultCollisionFilters, defaultCommonFilters } from '@/lib/filters/DefaultFilters';
import { getLocationsIconProps } from '@/lib/geo/CentrelineUtils';
import CompositeId from '@/lib/io/CompositeId';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMenuDownloadReportFormat from '@/web/components/inputs/FcMenuDownloadReportFormat.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';
import FcListLocationMulti from '@/web/components/location/FcListLocationMulti.vue';
import FcReport from '@/web/components/reports/FcReport.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
import DateTime from '@/lib/time/DateTime';

export default {
  name: 'FcDrawerViewCollisionReports',
  mixins: [FcMixinRouteAsync, FcMixinAuthScope],
  components: {
    FcButton,
    FcDialogConfirm,
    FcIconLocationMulti,
    FcListLocationMulti,
    FcMenuDownloadReportFormat,
    FcProgressCircular,
    FcProgressLinear,
    FcReport,
  },
  data() {
    return {
      collisionSummaryPerLocation: [],
      indexActiveReportType: 0,
      leaveConfirmed: false,
      LocationMode,
      loadingDownload: false,
      loadingReportLayout: false,
      nextRoute: null,
      reportLayout: null,
      reportTypes: [
        ReportType.COLLISION_DIRECTORY,
        ReportType.COLLISION_TABULATION,
      ],
      showConfirmLeave: false,
    };
  },
  computed: {
    userLoggedIn() {
      return this.auth.loggedIn;
    },
    userHasMvcrReadPermission() {
      return this.hasAuthScope(AuthScope.MVCR_READ);
    },
    activeReportId() {
      if (this.locationMode === LocationMode.SINGLE || this.detailView) {
        const s1 = CompositeId.encode(this.locationsActive);
        const selectionType = LocationSelectionType.POINTS;
        return `${s1}/${selectionType.name}`;
      }
      const { locations, selectionType } = this.locationsSelection;
      const s1 = CompositeId.encode(locations);
      return `${s1}/${selectionType.name}`;
    },
    activeReportType() {
      const { indexActiveReportType, reportTypes } = this;
      if (indexActiveReportType >= reportTypes.length) {
        return null;
      }
      return reportTypes[indexActiveReportType];
    },
    isDirectoryReport() {
      return this.activeReportType === ReportType.COLLISION_DIRECTORY;
    },
    disabledPerLocation() {
      return this.collisionSummaryPerLocation.map(({ amount }) => amount === 0);
    },
    itemsDownloadFormats() {
      if (this.loadingDownload || this.loadingReportLayout) {
        return [];
      }
      return ReportFormat.enumValues
        .filter(reportFormat => reportFormat.download)
        .filter(reportFormat => this.activeReportType.formats.includes(reportFormat))
        .map(({ name }) => ({ label: name, value: name }));
    },
    locationsActive() {
      if (this.locationMode === LocationMode.SINGLE || this.detailView) {
        return [this.locationActive];
      }
      return this.locations;
    },
    locationsIconProps() {
      const locationsIconProps = getLocationsIconProps(
        this.locations,
        this.locationsSelection.locations,
      );
      locationsIconProps[this.locationsIndex].selected = true;
      return locationsIconProps;
    },
    mvcrNumberColumnIndex() {
      if (!this.isDirectoryReport) return false;
      let colIndex = false;
      const headerRowOne = this.headerRowByIndex(0);
      const headerRowTwo = this.headerRowByIndex(1);
      if (Array.isArray(headerRowOne) && Array.isArray(headerRowTwo)) {
        const mvcrColIndex = headerRowOne.findIndex(h => h.value.toLowerCase() === 'mvcr');
        const numberColIndex = headerRowTwo.findIndex(h => h.value.toLowerCase() === 'number');
        if (mvcrColIndex === numberColIndex && mvcrColIndex !== -1) colIndex = mvcrColIndex;
      }
      return colIndex;
    },
    dateColumnIndex() {
      if (!this.isDirectoryReport) return false;
      let colIndex = false;
      const headerRowTwo = this.headerRowByIndex(1);
      if (Array.isArray(headerRowTwo)) {
        const dateColIndex = headerRowTwo.findIndex(h => h.value.toLowerCase() === 'date');
        if (dateColIndex !== -1) colIndex = dateColIndex;
      }
      return colIndex;
    },
    mvcrImgColumnIndex() {
      if (!this.isDirectoryReport) return false;
      let colIndex = false;
      const headerRowTwo = this.headerRowByIndex(1);
      if (Array.isArray(headerRowTwo)) {
        const dateColIndex = headerRowTwo.findIndex(h => h.value.toLowerCase() === 'cr');
        if (dateColIndex !== -1) colIndex = dateColIndex;
      }
      return colIndex;
    },
    rowsWithMvcrs() {
      const bodyRows = this.reportSectionRows('body');
      const rowsWithMvcrs = bodyRows.filter(row => row[this.mvcrImgColumnIndex].value);
      return rowsWithMvcrs;
    },
    mvcrCount() {
      return this.rowsWithMvcrs.length;
    },
    mvcrIds() {
      const mvcrIds = this.rowsWithMvcrs.map((row) => {
        const collisionDateStr = row[this.dateColumnIndex].value;
        const collisionDateArray = collisionDateStr.split('-');
        const id = {
          collisionId: row[this.mvcrNumberColumnIndex].value,
          collisionYear: collisionDateArray[0],
          collisionMonth: collisionDateArray[1],
        };
        return id;
      });
      return mvcrIds;
    },
    ...mapState([
      'locationMode',
      'locations',
      'locationsIndex',
      'locationsSelection',
      'auth',
    ]),
    ...mapState('viewData', ['detailView']),
    ...mapGetters([
      'locationActive',
      'locationsDescription',
      'locationsRouteParams',
    ]),
    ...mapGetters('viewData', ['filterParamsCollision']),
  },
  watch: {
    activeReportId() {
      this.updateReportLayout();
    },
    activeReportType() {
      this.updateReportLayout();
    },
  },
  beforeMount() {
    this.parseFiltersFromRouteParams();
  },
  beforeRouteLeave(to, from, next) {
    if (this.leaveConfirmed) {
      /*
       * The user clicked Leave on the confirmation dialog, and it is safe to leave.
       */
      next();
      return;
    }
    if (to.name === 'viewDataAtLocation') {
      const { s1, selectionTypeName } = from.params;
      const { s1: s1Next, selectionTypeName: selectionTypeNameNext } = to.params;
      if (s1 === s1Next && selectionTypeName === selectionTypeNameNext) {
        next();
        return;
      }
    }
    this.nextRoute = to;
    this.showConfirmLeave = true;
    next(false);
  },
  methods: {
    async actionDownload(format) {
      if (this.activeReportType === null) {
        return;
      }
      this.loadingDownload = true;
      getReportDownload(
        this.activeReportType,
        this.activeReportId,
        format,
        this.filterParamsCollision,
      );
      this.loadingDownload = false;
    },
    actionLeave() {
      this.leaveConfirmed = true;
      this.$router.push(this.nextRoute);
    },
    actionNavigateBack() {
      const params = this.locationsRouteParams;
      this.$router.push({
        name: 'viewDataAtLocation',
        params,
      });
    },
    async downloadAllMvcrs() {
      const job = await postJobCompressMvcrs(
        this.auth.csrf, this.mvcrIds, this.locationsDescription,
      );

      this.setToast({
        toast: 'MvcrJob',
        toastData: { job },
      });

      return true;
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });

      if (this.locationActive === null) {
        this.setLocationsIndex(0);
      }

      const collisionSummaryPerLocation = await getCollisionsByCentrelineSummaryPerLocation(
        this.locations,
        this.filterParamsCollision,
      );
      this.collisionSummaryPerLocation = collisionSummaryPerLocation;

      this.updateReportLayout();
    },
    async updateReportLayout() {
      if (this.activeReportType === null) {
        return;
      }
      this.loadingReportLayout = true;

      const reportLayout = await getReportWeb(
        this.activeReportType,
        this.activeReportId,
        this.filterParamsCollision,
      );
      this.reportLayout = reportLayout;

      this.loadingReportLayout = false;
    },
    parseFiltersFromRouteParams() {
      const routeParams = this.$route.params;
      if ('collisionFilters' in routeParams && routeParams.collisionFilters) {
        const defaultCommonFiltersObj = defaultCommonFilters();
        const defaultCollisionFiltersObj = defaultCollisionFilters();
        const setFilters = JSON.parse(routeParams.collisionFilters);

        const commonFilters = this.leftMergeObjects(defaultCommonFiltersObj, setFilters);
        const collisionFilters = this.leftMergeObjects(defaultCollisionFiltersObj, setFilters);

        if (commonFilters.dateRangeStart) {
          commonFilters.dateRangeStart = DateTime.fromString(commonFilters.dateRangeStart);
        }
        if (commonFilters.dateRangeEnd) {
          commonFilters.dateRangeEnd = DateTime.fromString(commonFilters.dateRangeEnd);
        }

        this.setFiltersCommon(commonFilters);
        this.setFiltersCollision(collisionFilters);
      }
      return true;
    },
    leftMergeObjects(obj1, obj2) {
      const mergedObj = {};
      Object.keys(obj1).forEach((key) => {
        if (key in obj2) {
          mergedObj[key] = obj2[key];
        } else {
          mergedObj[key] = obj1[key];
        }
      });
      return mergedObj;
    },
    reportSectionRows(section) {
      const reportContent = this.reportLayout.content[1].options;
      return reportContent[section];
    },
    headerRowByIndex(index) {
      if (!this.isDirectoryReport) return false;
      let row = false;
      const headerRows = this.reportSectionRows('header');
      if (Array.isArray(headerRows)) row = headerRows[index];
      return row;
    },
    ...mapMutations(['setLocationsIndex', 'setToast']),
    ...mapMutations('viewData', ['setFiltersCollision', 'setFiltersCommon']),
    ...mapActions(['initLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-view-collision-reports {
  max-height: calc(50vh - 26px);

  .fc-report-wrapper {
    position: relative;
    & > .fc-report-actions {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}

.drawer-open .fc-drawer-view-collision-reports {
  max-height: var(--full-height);
}
</style>
