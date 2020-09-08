<template>
  <div class="fc-drawer-request-study-edit d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-bulk="false"
      :is-create="false"
      @action-ok="actionLeave" />

    <header class="flex-grow-0 flex-shrink-0 shading">
      <FcHeaderRequestStudy
        :is-bulk="false"
        :is-create="false"
        @action-navigate-back="actionNavigateBack" />
    </header>

    <v-divider></v-divider>

    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 min-height-0">
      <FcDetailsStudyRequest
        v-model="studyRequest"
        :is-create="false"
        :location="locationActive"
        :v="$v.studyRequest"
        @action-navigate-back="actionNavigateBack" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import FcDetailsStudyRequest from '@/web/components/requests/FcDetailsStudyRequest.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerRequestStudyEdit',
  mixins: [FcMixinRouteAsync],
  components: {
    FcDetailsStudyRequest,
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
    routeNavigateBack() {
      const { id } = this.$route.params;
      return {
        name: 'requestStudyView',
        params: { id },
      };
    },
    ...mapGetters(['locationActive']),
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
      const { id } = to.params;
      const { studyRequest, studyRequestLocation } = await getStudyRequest(id);
      const features = [studyRequestLocation];
      const selectionType = LocationSelectionType.POINTS;
      await this.initLocations({ features, selectionType });

      this.studyRequest = studyRequest;
    },
    ...mapActions(['initLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-edit {
  max-height: calc(100vh - 52px);
}
</style>
