<template>
  <div class="fc-drawer-request-study-bulk-edit d-flex fill-height flex-column">
    <FcNavStudyRequest
      :study-request="studyRequestBulk" />

    <v-divider></v-divider>

    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <div v-else>
        <h2>TODO: bulk edit</h2>
      </div>
    </section>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { getStudyRequestBulk } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import FcNavStudyRequest from '@/web/components/requests/nav/FcNavStudyRequest.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

export default {
  name: 'FcDrawerRequestStudyBulkEdit',
  mixins: [FcMixinRouteAsync],
  components: {
    FcNavStudyRequest,
  },
  data() {
    return {
      studyRequestBulk: null,
      studyRequestLocations: new Map(),
      studyRequestUsers: new Map(),
    };
  },
  computed: {
    ...mapGetters(['locationActive']),
  },
  methods: {
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const {
        studyRequestBulk,
        studyRequestLocations,
        studyRequestUsers,
      } = await getStudyRequestBulk(id);
      const { s1, selectionType } = studyRequestBulk;
      const features = CompositeId.decode(s1);
      await this.initLocations({ features, selectionType });

      this.studyRequestBulk = studyRequestBulk;
      this.studyRequestLocations = studyRequestLocations;
      this.studyRequestUsers = studyRequestUsers;
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
