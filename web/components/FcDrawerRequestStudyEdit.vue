<template>
  <div class="fc-drawer-request-study-edit d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="false"
      @action-ok="actionLeave" />

    <FcNavStudyRequest
      :study-request="studyRequest"
      :study-request-bulk-name="studyRequestBulkName" />

    <v-divider></v-divider>

    <FcProgressLinear
      v-if="loading"
      aria-label="Loading study request for editing" />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <FcDetailsStudyRequest
        v-model="studyRequest"
        :is-create="false"
        :location="location"
        @action-navigate-back="actionNavigateBack" />
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
      studyRequestBulkName: null,
    };
  },
  computed: {
    location() {
      if (this.locations.length === 0) {
        return null;
      }
      return this.locations[0];
    },
    routeNavigateBack() {
      if (this.studyRequest === null) {
        return null;
      }
      return {
        name: 'requestStudyView',
        params: { id: this.studyRequest.id },
      };
    },
    studyRequest() {
      if (this.studyRequests.length === 0) {
        return null;
      }
      return this.studyRequests[0];
    },
    ...mapState('editRequests', ['studyRequests']),
    ...mapGetters('editRequests', ['locations']),
  },
  methods: {
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const { studyRequest } = await getStudyRequest(id);
      await this.setStudyRequestsForStudyRequest(studyRequest);
      this.setIndicesSelected([0]);

      let studyRequestBulkName = null;
      if (studyRequest.studyRequestBulkId !== null) {
        studyRequestBulkName = await getStudyRequestBulkName(studyRequest.studyRequestBulkId);
      }

      this.studyRequestBulkName = studyRequestBulkName;
    },
    ...mapMutations('editRequests', ['setIndicesSelected']),
    ...mapActions('editRequests', ['setStudyRequestsForStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-edit {
  max-height: var(--full-height);
}
</style>
