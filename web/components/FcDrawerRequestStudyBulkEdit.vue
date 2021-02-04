<template>
  <div class="fc-drawer-request-study-bulk-edit d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="false"
      @action-ok="actionLeave" />

    <FcNavStudyRequest
      ref="nav"
      :study-request="studyRequestBulk"
      :study-request-bulk-name="studyRequestBulkName" />

    <v-divider></v-divider>

    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 min-height-0">
      <FcEditStudyRequestBulk
        v-model="studyRequestBulk"
        @action-cancel="actionNavigateBack"
        @action-save="actionSave" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import { getStudyRequestBulk } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import { bulkIndicesDeselected } from '@/lib/requests/RequestStudyBulkUtils';
import FcEditStudyRequestBulk from '@/web/components/requests/FcEditStudyRequestBulk.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMixinRequestStudyLeaveGuard from '@/web/mixins/FcMixinRequestStudyLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerRequestStudyBulkEdit',
  mixins: [
    FcMixinRequestStudyLeaveGuard,
    FcMixinRouteAsync,
  ],
  components: {
    FcEditStudyRequestBulk,
    FcNavStudyRequest,
  },
  data() {
    return {
      studyRequestBulk: null,
    };
  },
  computed: {
    studyRequestBulkName() {
      if (this.studyRequestBulk === null) {
        return null;
      }
      return this.studyRequestBulk.name;
    },
    ...mapState(['locations']),
  },
  created() {
    this.setLocationsIndicesDeselected([]);
  },
  beforeDestroy() {
    this.setLocationsIndicesDeselected([]);
  },
  methods: {
    actionSave() {
      this.saveStudyRequestBulk(this.studyRequestBulk);
      this.actionNavigateBack(true);
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const { studyRequestBulk } = await getStudyRequestBulk(id);
      const { s1, selectionType } = studyRequestBulk;
      const features = CompositeId.decode(s1);
      await this.initLocations({ features, selectionType });

      this.studyRequestBulk = studyRequestBulk;

      const indicesDeselected = bulkIndicesDeselected(
        this.locations,
        this.studyRequestBulk.studyRequests,
      );
      this.setLocationsIndicesDeselected(indicesDeselected);
    },
    ...mapMutations(['setLocationsIndicesDeselected']),
    ...mapActions(['initLocations', 'saveStudyRequestBulk']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-edit {
  max-height: var(--full-height);
}
</style>
