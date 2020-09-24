<template>
  <div class="fc-drawer-request-study-bulk-edit d-flex fill-height flex-column">
    <FcNavStudyRequest
      ref="nav"
      :study-request="studyRequestBulk" />

    <v-divider></v-divider>

    <v-progress-linear
      v-if="loading"
      indeterminate />
    <div
      v-else
      class="flex-grow-1 flex-shrink-1 min-height-0">
      <FcEditStudyRequestBulk
        v-model="studyRequestBulk"
        @action-cancel="actionCancel"
        @action-save="actionSave" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import { getStudyRequestBulk } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import FcEditStudyRequestBulk from '@/web/components/requests/FcEditStudyRequestBulk.vue';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerRequestStudyBulkEdit',
  mixins: [FcMixinRouteAsync],
  components: {
    FcEditStudyRequestBulk,
    FcNavStudyRequest,
  },
  data() {
    return {
      studyRequestBulk: null,
    };
  },
  methods: {
    actionCancel() {
      this.$refs.nav.actionConfirmLeave();
    },
    actionSave() {
      this.saveStudyRequestBulk(this.studyRequestBulk);
      this.$refs.nav.actionLeave();
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const { studyRequestBulk } = await getStudyRequestBulk(id);
      const { s1, selectionType } = studyRequestBulk;
      const features = CompositeId.decode(s1);
      await this.initLocations({ features, selectionType });

      this.studyRequestBulk = studyRequestBulk;
    },
    ...mapActions(['initLocations', 'saveStudyRequestBulk']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-edit {
  max-height: var(--full-height);
}
</style>
