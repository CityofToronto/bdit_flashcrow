<template>
  <div class="fc-drawer-request-study-edit d-flex fill-height flex-column">
    <FcNavStudyRequest
      ref="nav"
      :study-request="studyRequest" />

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
        @action-leave="actionLeave" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import { getStudyRequest } from '@/lib/api/WebApi';
import FcDetailsStudyRequest from '@/web/components/requests/FcDetailsStudyRequest.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerRequestStudyEdit',
  mixins: [FcMixinRouteAsync],
  components: {
    FcDetailsStudyRequest,
    FcNavStudyRequest,
  },
  data() {
    return {
      studyRequest: null,
    };
  },
  computed: {
    ...mapGetters(['locationActive']),
  },
  methods: {
    actionLeave(leaveConfirmed = false) {
      if (leaveConfirmed) {
        this.$refs.nav.actionLeave();
      } else {
        this.$refs.nav.actionConfirmLeave();
      }
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
  max-height: var(--full-height);
}
</style>
