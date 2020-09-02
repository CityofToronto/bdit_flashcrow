<template>
  <div class="fc-drawer-request-study d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="isCreate"
      @action-ok="actionLeave" />
    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcHeaderRequestStudy
        :is-create="isCreate"
        @action-navigate-back="actionNavigateBack" />
    </header>

    <v-divider></v-divider>

    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <FcDetailsStudyRequest
        v-model="studyRequest"
        class="flex-grow-1 flex-shrink-1 overflow-y-auto pa-5"
        :is-create="isCreate"
        :location="locationActive"
        :v="$v.studyRequest" />

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

import { LocationSelectionType } from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import DateTime from '@/lib/time/DateTime';
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
    estimatedDeliveryDate() {
      const { now, studyRequest } = this;
      if (studyRequest === null) {
        return null;
      }
      const { dueDate, urgent } = studyRequest;
      if (dueDate === null) {
        return null;
      }
      if (urgent) {
        return dueDate;
      }
      return DateTime.max(
        dueDate.minus({ weeks: 1 }),
        now.plus({ months: 2 }),
      );
    },
    isCreate() {
      return this.$route.name === 'requestStudyNew';
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
    ...mapState(['locations', 'now']),
    ...mapGetters(['locationActive', 'locationsEmpty', 'locationsRouteParams']),
  },
  watch: {
    estimatedDeliveryDate() {
      this.studyRequest.estimatedDeliveryDate = this.estimatedDeliveryDate;
    },
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
