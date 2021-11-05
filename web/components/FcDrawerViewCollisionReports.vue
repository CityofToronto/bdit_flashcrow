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
            type="secondary"
            @click="actionNavigateBack">
            <v-icon left>mdi-chevron-left</v-icon>
            View Data
          </FcButton>
          <h2 class="ml-4">
            <span class="headline">Collisions</span>
            <span class="font-weight-regular headline secondary--text">
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
            <v-tabs v-model="indexActiveReportType">
              <v-tab
                v-for="reportType in reportTypes"
                :key="reportType.name">
                {{reportType.label}}
              </v-tab>
            </v-tabs>
          </nav>

          <v-spacer></v-spacer>

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
} from '@/lib/Constants';
import {
  getCollisionsByCentrelineSummaryPerLocation,
  getReportDownload,
  getReportWeb,
} from '@/lib/api/WebApi';
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

export default {
  name: 'FcDrawerViewCollisionReports',
  mixins: [FcMixinRouteAsync],
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
    ...mapState([
      'locationMode',
      'locations',
      'locationsIndex',
      'locationsSelection',
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
    ...mapMutations(['setLocationsIndex']),
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
  max-height: calc(var(--full-height) - 60px);
}
</style>
