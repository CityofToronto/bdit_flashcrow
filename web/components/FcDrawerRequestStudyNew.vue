<template>
  <div class="fc-drawer-request-study-new d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="true"
      @action-ok="actionLeave" />
    <FcDialogProjectMode
      v-model="showDialogProjectMode"
      :project-mode="projectMode"
      :study-requests="studyRequests"
      @action-cancel="actionCancelProjectMode"
      @action-save="actionSaveProjectMode" />

    <div class="shading pl-5 pr-5 pt-2 pb-2 d-flex
      flex-row align-center">
      <span class="flex-grow-1">
        <span>You are requesting <strong>{{messageStudyRequests}}</strong></span>
        <span v-if="projectMode !== ProjectMode.NONE && studyRequestBulk !== null">
          in project <strong>{{studyRequestBulk.name}}</strong>
        </span>
      </span>
      <FcMenuStudyRequestsProjectMode
        v-if="studyRequestBulk === null"
        :label="labelProject"
        text-inject="requested studies"
        @action-project-mode="actionSetProjectMode" />
      <FcButton
        v-else
        type="secondary"
        @click="actionRemoveFromProject">
        <v-icon color="primary" left>mdi-folder-remove</v-icon>
        <span>Remove From Project</span>
      </FcButton>
      <FcButton
        type="secondary"
        class="ml-2"
        @click="addStudyRequest">
        <v-icon color="primary" class="mr-2" small>mdi-plus-box</v-icon>
        Add Study
      </FcButton>
    </div>
    <v-divider></v-divider>

    <FcProgressLinear
      v-if="loading"
      aria-label="Loading form to request new studies" />
    <template v-else>
      <div
        ref="formWrapper"
        class="flex-grow-1 flex-shrink-1 overflow-y-auto">
        <fieldset>
          <FcStudyRequestBulkLocations
            ref="locations"
            v-model="internalIndicesSelected"
            :locations="locations"
            :most-recents="mostRecents"
            :study-requests="studyRequests"
            :v="$v.studyRequests"
            @action-focus-map="$emit('action-focus-map')"
            @action-remove-study="actionRemoveStudy" />
        </fieldset>

        <template v-if="studyRequests.length > 0">
          <FcStudyRequestUrgent
            class="px-5"
            :is-create="true"
            :nRequests="studyRequests.length"
            :v="$v.studyRequests.$each[0]" />
        </template>
      </div>

      <footer class="flex-grow-0 flex-shrink-0 shading">
        <v-divider></v-divider>

        <div class="d-flex flex-row-reverse px-3 py-2">
          <FcButton
            class="mr-2"
            :disabled="loadingSubmit || studyRequests.length === 0"
            :loading="loadingSubmit"
            type="primary"
            @click="actionSubmit">
            <span>Submit</span>
          </FcButton>
          <FcButton
            class="mr-2"
            type="tertiary"
            @click="actionNavigateBack(false)">
            Cancel
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

import { LocationSelectionType, ProjectMode } from '@/lib/Constants';
import { makeStudyRequest } from '@/lib/requests/RequestEmpty';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import ValidationsStudyRequestBulk from '@/lib/validation/ValidationsStudyRequestBulk';
import FcDialogConfirmRequestStudyLeave
  from '@/web/components/dialogs/FcDialogConfirmRequestStudyLeave.vue';
import FcDialogProjectMode from '@/web/components/dialogs/FcDialogProjectMode.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcStudyRequestBulkLocations
  from '@/web/components/requests/FcStudyRequestBulkLocations.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMenuStudyRequestsProjectMode
  from '@/web/components/requests/status/FcMenuStudyRequestsProjectMode.vue';
import FcMixinLeaveGuard from '@/web/mixins/FcMixinLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
// eslint-disable-next-line import/extensions
import StudyRequestFormMixin from '@/web/components/requests/StudyRequestFormMixin.js';
import { getFirstErrorText, scrollToFirstError } from '@/web/ui/FormUtils';

function mapUrgentWatchers(keys) {
  const watchers = {};
  keys.forEach((key) => {
    watchers[`studyRequestUrgent.${key}`] = {
      handler(value) {
        const n = this.studyRequests.length;
        for (let i = 0; i < n; i++) {
          this.studyRequests[i][key] = value;
        }
      },
      immediate: true,
    };
  });
  return watchers;
}

export default {
  name: 'FcDrawerRequestStudyNew',
  mixins: [
    FcMixinLeaveGuard,
    FcMixinRouteAsync,
    StudyRequestFormMixin,
  ],
  components: {
    FcButton,
    FcDialogConfirmRequestStudyLeave,
    FcDialogProjectMode,
    FcMenuStudyRequestsProjectMode,
    FcProgressLinear,
    FcStudyRequestBulkLocations,
    FcStudyRequestUrgent,
  },
  data() {
    return {
      loadingSubmit: false,
      projectMode: ProjectMode.NONE,
      projectModePrev: ProjectMode.NONE,
      ProjectMode,
      showDialogProjectMode: false,
      studyRequestBulk: null,
    };
  },
  computed: {
    formValid() {
      if (this.studyRequests.length === 0 || this.$v.studyRequests.$invalid) {
        return false;
      }
      if (this.projectMode === ProjectMode.NONE) {
        return true;
      }
      return !this.$v.studyRequestBulk.$invalid;
    },
    internalIndicesSelected: {
      get() {
        return this.indicesSelected;
      },
      set(indicesSelected) {
        this.setIndicesSelected(indicesSelected);
      },
    },
    labelProject() {
      if (this.projectMode === ProjectMode.NONE) {
        return 'Add to Project';
      }
      return 'Change Project';
    },
    messageStudyRequests() {
      const n = this.studyRequests.length;
      const studyRequestsPlural = n === 1 ? 'study' : 'studies';
      return `${n} ${studyRequestsPlural}`;
    },
    messagesProject() {
      if (this.projectMode === ProjectMode.CREATE_NEW) {
        return ['This project will be created with the requested studies.'];
      }
      if (this.projectMode === ProjectMode.ADD_TO_EXISTING) {
        return ['The requested studies will be added to this project.'];
      }
      return [];
    },
    routeNavigateBack() {
      return this.routeBackViewRequest;
    },
    studyRequestUrgent: {
      get() {
        if (this.studyRequests.length === 0) {
          return makeStudyRequest();
        }
        return { ...this.studyRequests[0] };
      },
      set(studyRequestUrgent) {
        if (this.studyRequests.length > 0) {
          this.studyRequests[0] = { ...studyRequestUrgent };
        }
      },
    },
    ...mapState('editRequests', ['indicesSelected', 'studyRequests']),
    ...mapGetters(['routeBackViewRequest']),
    ...mapGetters('editRequests', ['locations', 'mostRecents']),
  },
  validations: {
    studyRequestBulk: ValidationsStudyRequestBulk,
    studyRequestUrgent: ValidationsStudyRequest,
    studyRequests: {
      $each: ValidationsStudyRequest,
    },
  },
  watch: {
    'studyRequests.length': {
      handler(numStudyRequests, numStudyRequestsPrev) {
        if (numStudyRequests === 0) {
          this.projectMode = ProjectMode.NONE;
        }

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
    ...mapUrgentWatchers([
      'ccEmails',
      'dueDate',
      'urgent',
      'urgentReason',
    ]),
  },
  methods: {
    async addStudyRequest() {
      const lastLocation = this.locations[this.locations.length - 1];
      this.setToastInfo(`Added study at ${lastLocation.description}`);
      this.addStudyRequestAtLocation(lastLocation);
    },
    actionCancelProjectMode() {
      this.projectMode = this.projectModePrev;
    },
    actionRemoveFromProject() {
      this.projectMode = ProjectMode.NONE;
      this.studyRequestBulk = null;
    },
    actionRemoveStudy(i) {
      this.removeStudyRequest(i);
    },
    actionSaveProjectMode(studyRequestBulk) {
      this.studyRequestBulk = studyRequestBulk;
    },
    actionSetProjectMode(projectMode) {
      this.projectModePrev = this.projectMode;
      this.projectMode = projectMode;
      this.showDialogProjectMode = true;
    },
    async actionSubmit() {
      if (!this.formValid) {
        const $form = this.$refs.formWrapper;
        scrollToFirstError($form, '.fc-card-study-request');

        const errorText = getFirstErrorText(
          $form,
          'No studies requested, use the map to add a study at a location',
        );
        this.setToastError(errorText);
        return;
      }

      /*
       * Allows the user to leave the flow without confirmation.
       */
      this.leaveConfirmed = true;

      this.loadingSubmit = true;
      await this.sleep(500); // delay form submit so *urgent* input vals are added to store
      const { projectMode, studyRequestBulk } = this;
      const result = await this.createStudyRequests({ projectMode, studyRequestBulk });
      this.setToastInfo('Your request has been submitted.');
      this.loadingSubmit = false;

      let route;
      if (result === null) {
        route = { name: 'requestsTrack' };
      } else {
        const { id } = result;
        route = {
          name: 'requestStudyBulkView',
          params: { id },
        };
      }
      this.$router.push(route);
    },
    async loadAsyncForRoute(to) {
      const { s1, selectionTypeName } = to.params;
      const selectionType = LocationSelectionType.enumValueOf(selectionTypeName);
      await this.setStudyRequestsForLocationsSelection({ s1, selectionType });
    },
    ...mapMutations(['setToastBackendError', 'setToastError', 'setToastInfo']),
    ...mapMutations('editRequests', ['setIndicesSelected', 'removeStudyRequest']),
    ...mapActions('editRequests', [
      'createStudyRequests',
      'setStudyRequestsForLocationsSelection',
      'addStudyRequestAtLocation',
    ]),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-new {
  max-height: var(--full-height);
}
</style>
