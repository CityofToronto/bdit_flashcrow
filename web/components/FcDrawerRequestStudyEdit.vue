<template>
  <div class="fc-drawer-request-study-edit d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="false"
      @action-ok="actionLeave" />

    <FcNavStudyRequest
      ref="nav"
      :study-request="studyRequest"
      :study-request-bulk-name="studyRequestBulkName" />

    <v-divider></v-divider>

    <FcProgressLinear
      v-if="loading"
      aria-label="Loading study request for editing" />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 min-height-0">
      <FcDetailsStudyRequest
        v-model="studyRequest"
        :is-create="false"
        :location="locationActive"
        @action-navigate-back="actionNavigateBack" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { LocationSelectionType } from '@/lib/Constants';
import { getStudyRequest, getStudyRequestBulkName } from '@/lib/api/WebApi';
import FcDialogConfirmRequestStudyLeave
  from '@/web/components/dialogs/FcDialogConfirmRequestStudyLeave.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcDetailsStudyRequest from '@/web/components/requests/FcDetailsStudyRequest.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMixinLeaveGuard from '@/web/mixins/FcMixinLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerRequestStudyEdit',
  mixins: [
    FcMixinLeaveGuard,
    FcMixinRouteAsync,
  ],
  components: {
    FcDetailsStudyRequest,
    FcDialogConfirmRequestStudyLeave,
    FcNavStudyRequest,
    FcProgressLinear,
  },
  data() {
    return {
      studyRequest: null,
      studyRequestBulkName: null,
    };
  },
  computed: {
    ...mapGetters(['locationActive']),
  },
  methods: {
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const { studyRequest, studyRequestLocation } = await getStudyRequest(id);
      const features = [studyRequestLocation];
      const selectionType = LocationSelectionType.POINTS;
      await this.initLocations({ features, selectionType });

      let studyRequestBulkName = null;
      if (studyRequest.studyRequestBulkId !== null) {
        studyRequestBulkName = await getStudyRequestBulkName(studyRequest.studyRequestBulkId);
      }

      this.studyRequest = studyRequest;
      this.studyRequestBulkName = studyRequestBulkName;
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
