<template>
  <div class="fc-drawer-request-study-new d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-bulk="isBulk"
      :is-create="true"
      @action-ok="actionLeave" />

    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcHeaderRequestStudy
        :is-bulk="isBulk"
        :is-create="true"
        @action-navigate-back="actionNavigateBack" />
    </header>

    <v-divider></v-divider>

    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 min-height-0">
      <FcCreateStudyRequestBulk
        v-if="isBulk"
        v-model="studyRequestBulk"
        :locations="locations"
        :locations-selection="locationsSelection" />
      <FcDetailsStudyRequest
        v-else
        v-model="studyRequest"
        :is-create="true"
        :location="locationActive"
        :v="$v.studyRequest"
        @action-navigate-back="actionNavigateBack" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

import {
  LocationMode,
  LocationSelectionType,
} from '@/lib/Constants';
import CompositeId from '@/lib/io/CompositeId';
import FcDialogConfirmRequestStudyLeave
  from '@/web/components/dialogs/FcDialogConfirmRequestStudyLeave.vue';
import FcCreateStudyRequestBulk from '@/web/components/requests/FcCreateStudyRequestBulk.vue';
import FcDetailsStudyRequest from '@/web/components/requests/FcDetailsStudyRequest.vue';
import FcHeaderRequestStudy from '@/web/components/requests/FcHeaderRequestStudy.vue';
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
  return {
    serviceRequestId: null,
    urgent: false,
    urgentReason: null,
    assignedTo: null,
    dueDate,
    estimatedDeliveryDate: null,
    reasons: [],
    ccEmails: [],
    studyType: null,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: null,
    notes: '',
    centrelineId,
    centrelineType,
    geom,
  };
}

function makeStudyRequestBulk(now, locations) {
  const dueDate = now.plus({ months: 3 });
  const studyRequests = locations.map(
    location => makeStudyRequest(now, location),
  );
  return {
    ccEmails: [],
    dueDate,
    name: null,
    reason: null,
    studyRequests,
    urgent: false,
    urgentReason: null,
  };
}

export default {
  name: 'FcDrawerRequestStudyNew',
  mixins: [FcMixinRouteAsync],
  components: {
    FcCreateStudyRequestBulk,
    FcDetailsStudyRequest,
    FcDialogConfirmRequestStudyLeave,
    FcHeaderRequestStudy,
  },
  data() {
    return {
      leaveConfirmed: false,
      LocationMode,
      nextRoute: null,
      showConfirmLeave: false,
      studyRequest: null,
      studyRequestBulk: null,
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
    routeNavigateBack() {
      if (this.locationsEmpty) {
        return { name: 'viewData' };
      }
      const params = this.locationsRouteParams;
      return {
        name: 'viewDataAtLocation',
        params,
      };
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
    ]),
  },
  beforeRouteLeave(to, from, next) {
    if (this.leaveConfirmed) {
      next();
      return;
    }
    this.nextRoute = to;
    this.showConfirmLeave = true;
    next(false);
  },
  methods: {
    actionLeave() {
      this.leaveConfirmed = true;
      this.$router.push(this.nextRoute);
    },
    actionNavigateBack(leaveConfirmed = false) {
      this.leaveConfirmed = leaveConfirmed;
      this.$router.push(this.routeNavigateBack);
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.initLocations({ features, selectionType });

      if (this.isBulk) {
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
  max-height: calc(100vh - 52px);
}
</style>
