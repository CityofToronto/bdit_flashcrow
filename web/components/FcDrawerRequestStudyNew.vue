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

    <div
      v-if="studyRequests.length > 1"
      class="flex-grow-0 flex-shrink-0 shading">
      <FcHeaderStudyRequestBulkLocations
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
        <fieldset>
          <div class="align-center d-flex">
            <legend class="display-2 py-4 pl-5">Studies Requested</legend>
            <FcTextNumberTotal class="ml-2" :n="studyRequests.length" />

            <v-spacer></v-spacer>

            <FcMenuStudyRequestsProjectMode
              button-class="mr-3"
              :label="labelProject"
              text-inject="requested studies"
              @action-project-mode="actionSetProjectMode" />
            <FcButton
              v-if="projectMode !== ProjectMode.NONE"
              class="mr-2"
              type="secondary"
              @click="actionRemoveFromProject">
              <v-icon color="primary" left>mdi-folder-remove</v-icon>
              <span>Remove</span>
              <span class="sr-only">From Project</span>
            </FcButton>
          </div>

          <template v-if="studyRequestBulk !== null">
            <v-text-field
              class="mx-5 mt-3"
              label="Selected Project"
              :messages="messagesProject"
              outlined
              :value="studyRequestBulk.name">
              <template v-slot:append>
                <FcButtonAria
                  aria-label="Remove"
                  button-class="mt-n2"
                  right
                  type="icon"
                  @click="actionRemoveFromProject">
                  <v-icon>mdi-close</v-icon>
                </FcButtonAria>
              </template>
            </v-text-field>
            <v-divider class="mt-3 mb-6 ml-5"></v-divider>
          </template>

          <div class="align-center d-flex">
            <div class="mx-8"></div>
            <v-card
              v-if="internalIndicesSelected.length <= 1"
              class="fc-card-study-request flex-grow-1 flex-shrink-1"
              outlined>
              <v-card-text class="pb-0">
                <p class="font-weight-regular headline">
                  <span v-if="internalIndicesSelected.length === 0">
                    Use the map to add a study at a location.  You can add more
                    than one study at the same location.
                  </span>
                  <span v-else>
                    Use the map to set the location of the selected study.
                  </span>
                </p>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <FcButton
                  type="tertiary"
                  @click="$emit('action-focus-map')">
                  Search Map
                </FcButton>
              </v-card-actions>
            </v-card>
            <div class="mx-7"></div>
          </div>

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
          <v-divider class="mt-5 mb-1 ml-5"></v-divider>

          <FcStudyRequestUrgent
            class="pt-5 px-5"
            :is-create="true"
            :v="$v.studyRequests.$each[0]" />
        </template>
      </div>

      <footer class="flex-grow-0 flex-shrink-0 shading">
        <v-divider></v-divider>

        <div class="align-center d-flex px-3 py-2">
          <span>
            <span>You are requesting <strong>{{messageStudyRequests}}</strong></span>
            <span v-if="projectMode !== ProjectMode.NONE && studyRequestBulk !== null">
              in project <strong>{{studyRequestBulk.name}}</strong>
            </span>
          </span>

          <v-spacer></v-spacer>

          <FcButton
            class="mr-2"
            type="tertiary"
            @click="actionNavigateBack(false)">
            Cancel
          </FcButton>
          <FcButton
            :disabled="loadingSubmit || studyRequests.length === 0"
            :loading="loadingSubmit"
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

import { LocationSelectionType, ProjectMode } from '@/lib/Constants';

import { makeStudyRequest } from '@/lib/requests/RequestEmpty';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import ValidationsStudyRequestBulk from '@/lib/validation/ValidationsStudyRequestBulk';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcDialogConfirmRequestStudyLeave
  from '@/web/components/dialogs/FcDialogConfirmRequestStudyLeave.vue';
import FcDialogProjectMode from '@/web/components/dialogs/FcDialogProjectMode.vue';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcHeaderStudyRequestBulkLocations
  from '@/web/components/requests/FcHeaderStudyRequestBulkLocations.vue';
import FcStudyRequestBulkLocations
  from '@/web/components/requests/FcStudyRequestBulkLocations.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMenuStudyRequestsProjectMode
  from '@/web/components/requests/status/FcMenuStudyRequestsProjectMode.vue';
import FcMixinLeaveGuard from '@/web/mixins/FcMixinLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
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
  ],
  components: {
    FcButton,
    FcButtonAria,
    FcDialogConfirmRequestStudyLeave,
    FcDialogProjectMode,
    FcHeaderStudyRequestBulkLocations,
    FcMenuStudyRequestsProjectMode,
    FcProgressLinear,
    FcStudyRequestBulkLocations,
    FcStudyRequestUrgent,
    FcTextNumberTotal,
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
      'reason',
      'reasonOther',
      'urgent',
      'urgentReason',
    ]),
  },
  methods: {
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
    ]),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-new {
  max-height: var(--full-height);
}
</style>
