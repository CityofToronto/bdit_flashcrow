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
        <fieldset>
          <legend class="display-2 py-4 pl-5">Studies Requested</legend>

          <FcStudyRequestBulkLocations2
            ref="locations"
            v-model="internalIndicesSelected"
            :locations="locations"
            :study-requests="studyRequests"
            :v="$v.studyRequests"
            @remove-study="actionRemoveStudy" />
        </fieldset>

        <template v-if="studyRequests.length > 0">
          <v-divider class="mt-5 ml-5"></v-divider>

          <FcStudyRequestUrgent
            class="pt-5 px-5"
            :is-create="true"
            :v="$v.studyRequests.$each[0]" />

          <v-divider class="mt-5 ml-5"></v-divider>

          <div class="pa-5">
            <div class="align-center d-flex">
              <FcMenu
                button-class="mr-2"
                :items="[ProjectMode.CREATE_NEW, ProjectMode.ADD_TO_EXISTING]"
                @action-menu="actionSetProjectMode">
                <v-icon left>mdi-folder-plus</v-icon>
                <span>Add To Project</span>
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
                Remove From Project
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
        </template>
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
            :disabled="loadingSubmit"
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
import {
  getLocationsByCentreline,
  getLocationsByCorridor,
} from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import { makeStudyRequest, makeStudyRequestBulk } from '@/lib/requests/RequestEmpty';
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
      loadingSubmit: false,
      projectMode: ProjectMode.NONE,
      ProjectMode,
      studyRequestBulk: null,
    };
  },
  computed: {
    errorMessagesAddToProject() {
      if (this.$v.studyRequestBulk.$invalid) {
        return ['Please select an existing project to add these requests to.'];
      }
      return [];
    },
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
    ...mapGetters('editRequests', ['locations']),
  },
  validations: {
    studyRequestBulk: ValidationsStudyRequestBulk,
    studyRequestUrgent: ValidationsStudyRequest,
    studyRequests: {
      $each: ValidationsStudyRequest,
    },
  },
  watch: {
    projectMode() {
      if (this.projectMode === ProjectMode.CREATE_NEW) {
        this.studyRequestBulk = makeStudyRequestBulk();
      } else {
        this.studyRequestBulk = null;
      }
    },
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
    actionRemoveStudy(i) {
      this.removeStudyRequest(i);
    },
    actionSetProjectMode(projectMode) {
      this.projectMode = projectMode;
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
       * Allows the user to leave the flow without
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
    ...mapMutations(['setToastBackendError', 'setToastError', 'setToastInfo']),
    ...mapMutations('editRequests', ['setIndicesSelected', 'removeStudyRequest']),
    ...mapActions('editRequests', ['createStudyRequests', 'setStudyRequestsAtLocations']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study-new-2 {
  max-height: var(--full-height);
}
</style>
