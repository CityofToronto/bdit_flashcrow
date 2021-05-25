<template>
  <div class="fc-drawer-request-study-new-2 d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="true"
      @action-ok="actionLeave" />

    <div class="flex-grow-0 flex-shrink-0">
      <div class="px-5 py-3 shading">
        <h2 class="display-3">
          {{title}}
        </h2>
      </div>

      <v-divider></v-divider>

      <FcHeaderStudyRequestBulkLocations2
        v-model="internalIndicesSelected"
        :locations="locations"
        :study-requests="studyRequests" />

      <v-divider></v-divider>
    </div>

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <FcStudyRequestBulkLocations2
        v-model="internalIndicesSelected"
        :locations="locations"
        :study-requests="studyRequests"
        :v="$v.studyRequests" />
    </div>

    <footer class="flex-grow-0 flex-shrink-0 shading">
      <div class="align-center d-flex px-3 py-2">
        <v-spacer></v-spacer>

        <FcButton
          class="mr-2"
          type="tertiary"
          @click="actionNavigateBack">
          Cancel
        </FcButton>
        <FcButton
          type="primary"
          @click="actionSubmit">
          <span>Submit</span>
        </FcButton>
      </div>
    </footer>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcHeaderStudyRequestBulkLocations2
  from '@/web/components/requests/FcHeaderStudyRequestBulkLocations2.vue';
import FcStudyRequestBulkLocations2
  from '@/web/components/requests/FcStudyRequestBulkLocations2.vue';
import FcMixinRequestStudyLeaveGuard from '@/web/mixins/FcMixinRequestStudyLeaveGuard';

export default {
  name: 'FcDrawerRequestStudyNew2',
  mixins: [FcMixinRequestStudyLeaveGuard],
  components: {
    FcHeaderStudyRequestBulkLocations2,
    FcStudyRequestBulkLocations2,
  },
  computed: {
    internalIndicesSelected: {
      get() {
        return this.indicesSelected;
      },
      set(indicesSelected) {
        this.setIndicesSelected(indicesSelected);
      },
    },
    title() {
      if (this.studyRequests.length <= 1) {
        return 'New Request';
      }
      return 'New Bulk Request';
    },
    ...mapState('editRequests', ['indicesSelected', 'studyRequests']),
    ...mapGetters('editRequests', ['locations']),
  },
  validations: {
    studyRequests: {
      $each: ValidationsStudyRequest,
    },
  },
  methods: {
    async actionSubmit() {
      this.loadingSubmit = true;
      this.step = null;

      const studyRequestBulk = await this.saveStudyRequestBulk();
      this.internalValue = studyRequestBulk;

      this.setToastInfo('Your new count request has been submitted.');
      this.loadingSubmit = false;
    },
    ...mapMutations('editRequests', ['setIndicesSelected']),
    ...mapActions('editRequests', ['saveStudyRequestBulk']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-new-2 {
  max-height: var(--full-height);
}
</style>
