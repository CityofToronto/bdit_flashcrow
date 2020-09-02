<template>
  <div class="fc-drawer-request-study d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="isCreate"
      @action-ok="actionLeave" />
    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcHeaderRequestStudy
        :is-create="isCreate"
        :is-single-location="isSingleLocation"
        @action-navigate-back="actionNavigateBack" />
    </header>

    <v-divider></v-divider>

    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div class="flex-grow-1 flex-shrink-1 overflow-y-auto pa-5">
        <FcDetailsStudyRequest
          v-if="isSingleLocation"
          v-model="studyRequest"
          :is-create="isCreate"
          :location="locationActive"
          :v="$v.studyRequest" />
        <h2 v-else>
          TODO: multi-location request study wizard!
        </h2>
      </div>

      <v-divider></v-divider>

      <footer class="flex-grow-0 flex-shrink-0">
        <FcFooterRequestStudy
          :is-create="isCreate"
          :study-request="studyRequest"
          :v="$v.studyRequest"
          @action-navigate-back="actionNavigateBack"
          @action-submit="actionSubmit" />
      </footer>
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
} from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcDetailsStudyRequest from '@/web/components/FcDetailsStudyRequest.vue';
import FcDialogConfirmRequestStudyLeave
  from '@/web/components/dialogs/FcDialogConfirmRequestStudyLeave.vue';
import FcFooterRequestStudy from '@/web/components/requests/FcFooterRequestStudy.vue';
import FcHeaderRequestStudy from '@/web/components/requests/FcHeaderRequestStudy.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

function makeStudyRequest(now) {
  const dueDate = now.plus({ months: 3 });
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
    centrelineId: null,
    centrelineType: null,
    geom: null,
  };
}

export default {
  name: 'FcDrawerRequestStudy',
  mixins: [FcMixinRouteAsync],
  components: {
    FcDetailsStudyRequest,
    FcDialogConfirmRequestStudyLeave,
    FcFooterRequestStudy,
    FcHeaderRequestStudy,
  },
  data() {
    return {
      leaveConfirmed: false,
      nextRoute: null,
      showConfirmLeave: false,
      studyRequest: null,
    };
  },
  computed: {
    isCreate() {
      return this.$route.name === 'requestStudyNew';
    },
    isSingleLocation() {
      return this.locationMode === LocationMode.SINGLE || this.detailView;
    },
    locationsActive() {
      if (this.locationMode === LocationMode.SINGLE || this.detailView) {
        return [this.locationActive];
      }
      return this.locations;
    },
    routeNavigateBack() {
      if (!this.isCreate) {
        const { id } = this.$route.params;
        return {
          name: 'requestStudyView',
          params: { id },
        };
      }
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
    actionNavigateBack() {
      this.$router.push(this.routeNavigateBack);
    },
    actionSubmit() {
      this.saveStudyRequest(this.studyRequest);
      this.leaveConfirmed = true;
      this.$router.push(this.routeNavigateBack);
    },
    async loadAsyncForRoute(to) {
      let studyRequest;
      if (this.isCreate) {
        const { s1, selectionTypeName } = to.params;
        const features = CompositeId.decode(s1);
        const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
        await this.initLocations({ features, selectionType });
        const { now } = this;
        studyRequest = makeStudyRequest(now);
      } else {
        const { id } = to.params;
        const result = await getStudyRequest(id);
        studyRequest = result.studyRequest;
        const features = [result.studyRequestLocation];
        const selectionType = LocationSelectionType.POINTS;
        await this.initLocations({ features, selectionType });
      }
      this.studyRequest = studyRequest;
    },
    ...mapMutations(['setLocations']),
    ...mapActions(['initLocations', 'saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study {
  max-height: calc(100vh - 52px);
}
</style>
