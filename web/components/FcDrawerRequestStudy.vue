<template>
  <div class="fc-drawer-request-study d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-bulk="isBulk"
      :is-create="isCreate"
      @action-ok="actionLeave" />

    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcHeaderRequestStudy
        :is-bulk="isBulk"
        :is-create="isCreate"
        @action-navigate-back="actionNavigateBack" />
    </header>

    <v-divider></v-divider>

    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 min-height-0">
      <FcDetailsStudyRequestBulk
        v-if="isBulk"
        v-model="studyRequestBulk"
        :locations="locations" />
      <FcDetailsStudyRequest
        v-else
        v-model="studyRequest"
        :is-create="isCreate"
        :location="locationActive"
        :v="$v.studyRequest"
        @action-navigate-back="actionNavigateBack"
        @action-submit="actionSubmitStudyRequest" />
    </div>
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
} from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcDialogConfirmRequestStudyLeave
  from '@/web/components/dialogs/FcDialogConfirmRequestStudyLeave.vue';
import FcDetailsStudyRequest from '@/web/components/requests/FcDetailsStudyRequest.vue';
import FcDetailsStudyRequestBulk from '@/web/components/requests/FcDetailsStudyRequestBulk.vue';
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

/* eslint-disable-next-line no-unused-vars */
function makeStudyRequestBulk(now, locations) {
  // const dueDate = now.plus({ months: 3 });
  return {
    // TODO: bulk study request fields
  };
}

export default {
  name: 'FcDrawerRequestStudy',
  mixins: [FcMixinRouteAsync],
  components: {
    FcDetailsStudyRequest,
    FcDetailsStudyRequestBulk,
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
    };
  },
  computed: {
    isBulk() {
      return this.locationMode !== LocationMode.SINGLE && !this.detailView;
    },
    isCreate() {
      return this.$route.name === 'requestStudyNew';
    },
    locationsActive() {
      if (this.locationMode === LocationMode.SINGLE || this.detailView) {
        return [this.locationActive];
      }
      return this.locations;
    },
    routeNavigateBack() {
      if (this.isCreate) {
        if (this.locationsEmpty) {
          return { name: 'viewData' };
        }
        const params = this.locationsRouteParams;
        return {
          name: 'viewDataAtLocation',
          params,
        };
      }
      // TODO: handle bulk requests
      const { id } = this.$route.params;
      return {
        name: 'requestStudyView',
        params: { id },
      };
    },
    ...mapState([
      'locationMode',
      'locations',
      'now',
    ]),
    ...mapState('viewData', ['detailView']),
    ...mapGetters([
      'locationActive',
      'locationsEmpty',
      'locationsRouteParams',
    ]),
  },
  validations: ValidationsStudyRequest,
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
      if (this.isCreate) {
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
      } else {
        // TODO: handle bulk study request
        const { id } = to.params;
        const { studyRequest, studyRequestLocation } = await getStudyRequest(id);
        const features = [studyRequestLocation];
        const selectionType = LocationSelectionType.POINTS;
        await this.initLocations({ features, selectionType });

        this.studyRequest = studyRequest;
      }
    },
    ...mapMutations(['setLocations']),
    ...mapActions(['initLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study {
  max-height: calc(100vh - 52px);
}
</style>
