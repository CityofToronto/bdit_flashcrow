<template>
  <div class="fc-drawer-request-study-new d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="true"
      @action-ok="actionLeave" />

    <FcNavStudyRequest
      ref="nav"
      :is-create="true"
      :study-request="isBulk ? studyRequestBulk : studyRequest" />

    <v-divider v-if="!isBulk"></v-divider>

    <FcProgressLinear
      v-if="loading"
      aria-label="Loading Request New Study form" />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 min-height-0">
      <FcCreateStudyRequestBulk
        v-if="isBulk"
        v-model="studyRequestBulk"
        :locations="locations"
        :locations-selection="locationsSelection"
        :study-summary-per-location-unfiltered="studySummaryPerLocationUnfiltered"
        @action-navigate-back="actionNavigateBack"
        @action-view-details="actionViewDetails" />
      <FcDetailsStudyRequest
        v-else
        v-model="studyRequest"
        :is-create="true"
        :location="locationActive"
        @action-navigate-back="actionNavigateBack" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import {
  CentrelineType,
  LocationMode,
  LocationSelectionType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import { getStudiesByCentrelineSummaryPerLocation } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcCreateStudyRequestBulk from '@/web/components/requests/FcCreateStudyRequestBulk.vue';
import FcDetailsStudyRequest from '@/web/components/requests/FcDetailsStudyRequest.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMixinRequestStudyLeaveGuard from '@/web/mixins/FcMixinRequestStudyLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

function makeStudyRequest(now, location) {
  const dueDate = now.plus({ months: 3 });
  const {
    centrelineId,
    centrelineType,
    lng,
    lat,
  } = location;
  const geom = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  let duration = null;
  let hours = null;
  let studyType = null;
  if (centrelineType === CentrelineType.INTERSECTION) {
    hours = StudyHours.ROUTINE;
    studyType = StudyType.TMC;
  } else {
    duration = 72;
  }
  return {
    urgent: false,
    urgentReason: null,
    dueDate,
    reason: null,
    reasonOther: null,
    ccEmails: [],
    studyType,
    studyTypeOther: null,
    daysOfWeek: [2, 3, 4],
    duration,
    hours,
    notes: '',
    centrelineId,
    centrelineType,
    geom,
  };
}

function makeStudyRequestBulk(now, locations) {
  const studyRequests = locations.map(
    location => makeStudyRequest(now, location),
  );
  return {
    ccEmails: [],
    name: null,
    notes: null,
    studyRequests,
  };
}

export default {
  name: 'FcDrawerRequestStudyNew',
  mixins: [
    FcMixinRequestStudyLeaveGuard,
    FcMixinRouteAsync,
  ],
  components: {
    FcCreateStudyRequestBulk,
    FcDetailsStudyRequest,
    FcNavStudyRequest,
    FcProgressLinear,
  },
  data() {
    return {
      LocationMode,
      studyRequest: null,
      studyRequestBulk: null,
      studySummaryPerLocationUnfiltered: [],
    };
  },
  computed: {
    isBulk() {
      return this.locationMode !== LocationMode.SINGLE && !this.detailView;
    },
    locationsActive() {
      if (this.locationMode === LocationMode.SINGLE || this.detailView) {
        return [this.locationActive];
      }
      return this.locations;
    },
    ...mapState([
      'locationMode',
      'locations',
      'locationsSelection',
      'now',
    ]),
    ...mapState('viewData', ['detailView']),
    ...mapGetters([
      'locationActive',
      'locationsEmpty',
      'locationsRouteParams',
      'routeBackViewRequest',
    ]),
  },
  watch: {
    studyRequestBulk() {
      if (this.studyRequestBulk !== null && this.studyRequestBulk.id !== undefined) {
        /*
         * This allows the user to leave the final "step" of the bulk request wizard without
         * being warned about losing data - which is untrue at that point, as the request has
         * already been saved.
         */
        this.leaveConfirmed = true;
      }
    },
  },
  methods: {
    actionViewDetails() {
      const { id } = this.studyRequestBulk;
      const route = {
        name: 'requestStudyBulkView',
        params: { id },
      };
      this.$router.push(route);
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });

      if (this.isBulk) {
        const studySummaryPerLocationUnfiltered = await getStudiesByCentrelineSummaryPerLocation(
          this.locations,
          {},
        );
        this.studySummaryPerLocationUnfiltered = studySummaryPerLocationUnfiltered;

        const studyRequestBulk = makeStudyRequestBulk(this.now, this.locations);
        this.studyRequest = null;
        this.studyRequestBulk = studyRequestBulk;
      } else {
        const studyRequest = makeStudyRequest(this.now, this.locationActive);
        this.studyRequest = studyRequest;
        this.studyRequestBulk = null;
      }
    },
    ...mapActions(['initLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-new {
  max-height: var(--full-height);
}
</style>
