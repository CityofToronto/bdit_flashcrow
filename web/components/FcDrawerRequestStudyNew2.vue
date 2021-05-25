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

    <FcProgressLinear
      v-if="loading"
      aria-label="Loading form to request new studies" />
    <template v-else>
      <div
        ref="formWrapper"
        class="flex-grow-1 flex-shrink-1 overflow-y-auto">
        <FcStudyRequestBulkLocations2
          v-model="internalIndicesSelected"
          :locations="locations"
          :study-requests="studyRequests"
          :v="$v.studyRequests"
          @remove-study="actionRemoveStudy" />
      </div>

      <footer class="flex-grow-0 flex-shrink-0 shading">
        <v-divider></v-divider>

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
import {
  getLocationsByCentreline,
  getLocationsByCorridor,
} from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcHeaderStudyRequestBulkLocations2
  from '@/web/components/requests/FcHeaderStudyRequestBulkLocations2.vue';
import FcStudyRequestBulkLocations2
  from '@/web/components/requests/FcStudyRequestBulkLocations2.vue';
import FcMixinRequestStudyLeaveGuard from '@/web/mixins/FcMixinRequestStudyLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
import { getFirstErrorText, scrollToFirstError } from '@/web/ui/FormUtils';

export default {
  name: 'FcDrawerRequestStudyNew2',
  mixins: [
    FcMixinRequestStudyLeaveGuard,
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcHeaderStudyRequestBulkLocations2,
    FcProgressLinear,
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
    routeNavigateBack() {
      return this.routeBackViewRequest;
    },
    title() {
      if (this.studyRequests.length <= 1) {
        return 'New Request';
      }
      return 'New Bulk Request';
    },
    ...mapState('editRequests', ['indicesSelected', 'studyRequests']),
    ...mapGetters(['routeBackViewRequest']),
    ...mapGetters('editRequests', ['locations']),
  },
  validations: {
    studyRequests: {
      $each: ValidationsStudyRequest,
    },
  },
  methods: {
    actionRemoveStudy(i) {
      this.removeStudyRequest(i);
    },
    async actionSubmit() {
      if (this.$v.$invalid) {
        const $form = this.$refs.formWrapper;
        scrollToFirstError($form, '.fc-card-study-request');

        const errorText = getFirstErrorText($form);
        this.setToastError(errorText);
        return;
      }

      this.loadingSubmit = true;
      this.step = null;

      const studyRequestBulk = await this.saveStudyRequestBulk();
      this.internalValue = studyRequestBulk;

      this.setToastInfo('Your new count request has been submitted.');
      this.loadingSubmit = false;
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const features = CompositeId.decode(s1);
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);

      let locations = await getLocationsByCentreline(features);
      /*
       * Since this endpoint can return `null` values, we filter those out here.  If this does
       * change the list of features, it should trigger an update of the route parameters.
       */
      locations = locations.filter(location => location !== null);
      if (selectionType === LocationSelectionType.CORRIDOR) {
        try {
          locations = await getLocationsByCorridor(locations);
        } catch (err) {
          this.setToastBackendError(err);
          throw err;
        }
      }
      this.setStudyRequestsAtLocations(locations);
    },
    ...mapMutations(['setToastBackendError', 'setToastError']),
    ...mapMutations('editRequests', ['setIndicesSelected', 'removeStudyRequest']),
    ...mapActions('editRequests', ['saveStudyRequestBulk', 'setStudyRequestsAtLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-new-2 {
  max-height: var(--full-height);
}
</style>
