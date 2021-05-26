<template>
  <div class="fc-drawer-request-study-new-2 d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="true"
      @action-ok="actionLeave" />

    <div class="flex-grow-0 flex-shrink-0 shading">
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
          ref="locations"
          v-model="internalIndicesSelected"
          :locations="locations"
          :study-requests="studyRequests"
          :v="$v.studyRequests"
          @remove-study="actionRemoveStudy" />

        <v-divider></v-divider>

        <FcStudyRequestUrgent
          class="pt-5 px-5"
          :is-create="true"
          :v="$v.studyRequests.$each[0]" />

        <v-divider></v-divider>

        <div class="pa-5">
          <div class="align-center d-flex">
            <FcMenu
              button-class="mr-2"
              :items="[ProjectMode.CREATE_NEW, ProjectMode.ADD_TO_EXISTING]"
              @action-menu="actionSetProjectMode">
              <v-icon left>mdi-folder-plus</v-icon>
              <span>Create Project</span>
              <template v-slot:item="{ item }">
                <span>{{item.title}}</span>
                <v-messages :value="[item.subtitle]" />
              </template>
            </FcMenu>
            <v-spacer></v-spacer>
            <FcButton
              v-if="projectMode !== ProjectMode.NONE"
              type="secondary"
              @click="projectMode = ProjectMode.NONE">
              <v-icon left>mdi-folder-remove</v-icon>
              Remove Project
            </FcButton>
          </div>

          <p
            v-if="projectMode === ProjectMode.NONE"
            class="my-8 py-12 secondary--text text-center">
            No project selected,<br>
            these studies will be requested individually
          </p>
          <FcStudyRequestBulkDetails
            v-if="projectMode === ProjectMode.CREATE_NEW"
            v-model="studyRequestBulk"
            :is-create="true"
            :v="$v.studyRequestBulk" />
          <div v-else-if="projectMode === ProjectMode.ADD_TO_EXISTING">
            <FcInputProjectSearch
              v-model="studyRequestBulk"
              :error-messages="errorMessagesAddToProject"
              class="mt-6" />
          </div>
        </div>
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
import Vue from 'vue';
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import { Enum } from '@/lib/ClassUtils';
import { LocationSelectionType } from '@/lib/Constants';
import {
  getLocationsByCentreline,
  getLocationsByCorridor,
} from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import ValidationsStudyRequestBulk from '@/lib/validation/ValidationsStudyRequestBulk';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcInputProjectSearch from '@/web/components/inputs/FcInputProjectSearch.vue';
import FcMenu from '@/web/components/inputs/FcMenu.vue';
import FcHeaderStudyRequestBulkLocations2
  from '@/web/components/requests/FcHeaderStudyRequestBulkLocations2.vue';
import FcStudyRequestBulkDetails
  from '@/web/components/requests/FcStudyRequestBulkDetails.vue';
import FcStudyRequestBulkLocations2
  from '@/web/components/requests/FcStudyRequestBulkLocations2.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMixinRequestStudyLeaveGuard from '@/web/mixins/FcMixinRequestStudyLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
import { getFirstErrorText, scrollToFirstError } from '@/web/ui/FormUtils';

class ProjectMode extends Enum {}
ProjectMode.init({
  NONE: {},
  CREATE_NEW: {
    title: 'New Project',
    subtitle: 'Create new project with requested studies.',
  },
  ADD_TO_EXISTING: {
    title: 'Existing Project',
    subtitle: 'Add requested studies to existing project.',
  },
});

function makeStudyRequestBulk() {
  return {
    ccEmails: [],
    name: null,
    notes: null,
    studyRequests: [],
  };
}

export default {
  name: 'FcDrawerRequestStudyNew2',
  mixins: [
    FcMixinRequestStudyLeaveGuard,
    FcMixinRouteAsync,
  ],
  components: {
    FcButton,
    FcHeaderStudyRequestBulkLocations2,
    FcInputProjectSearch,
    FcMenu,
    FcProgressLinear,
    FcStudyRequestBulkDetails,
    FcStudyRequestBulkLocations2,
    FcStudyRequestUrgent,
  },
  data() {
    return {
      projectMode: ProjectMode.NONE,
      ProjectMode,
      studyRequestBulk: makeStudyRequestBulk(),
    };
  },
  computed: {
    errorMessagesAddToProject() {
      if (this.$v.studyRequestBulk.$invalid) {
        return ['Please select a project to add these requests to.'];
      }
      return [];
    },
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
    ...mapState('editRequests', ['indicesSelected', 'studyRequests']),
    ...mapGetters(['routeBackViewRequest']),
    ...mapGetters('editRequests', ['locations']),
  },
  validations: {
    studyRequests: {
      $each: ValidationsStudyRequest,
    },
    studyRequestBulk: ValidationsStudyRequestBulk,
  },
  watch: {
    projectMode() {
      if (this.projectMode === ProjectMode.ADD_TO_EXISTING) {
        this.studyRequestBulk = null;
      } else {
        this.studyRequestBulk = makeStudyRequestBulk();
      }
    },
    'studyRequests.length': {
      handler(numStudyRequests, numStudyRequestsPrev) {
        const $form = this.$refs.formWrapper;
        const $locations = this.$refs.locations;
        if (!!$form
          && !!$locations
          && numStudyRequestsPrev > 0
          && numStudyRequests > numStudyRequestsPrev) {
          Vue.nextTick(() => {
            $form.scrollTop = $locations.$el.scrollHeight - 400;
          });
        }
      },
    },
  },
  methods: {
    actionRemoveStudy(i) {
      this.removeStudyRequest(i);
    },
    actionSetProjectMode(projectMode) {
      this.projectMode = projectMode;
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
