<template>
  <div class="fc-drawer-request-study-bulk-edit-2 d-flex fill-height flex-column">
    <FcDialogConfirmRequestStudyLeave
      v-model="showConfirmLeave"
      :is-create="false"
      @action-ok="actionLeave" />

    <FcProgressLinear
      v-if="loading"
      aria-label="Loading bulk study request for editing" />
    <template v-else>
      <div class="flex-grow-0 flex-shrink-0 shading">
        <div class="pt-4 px-5">
          <h2 class="display-3 mb-4">
            Project #{{studyRequestBulk.id}}: {{studyRequestBulk.name}}
          </h2>
          <FcBreadcrumbsStudyRequest
            class="mb-6"
            :study-request="studyRequestBulk"
            :study-request-bulk-name="studyRequestBulk.name" />
        </div>

        <v-divider></v-divider>
      </div>

      <div
        ref="formWrapper"
        class="flex-grow-1 flex-shrink-1 overflow-y-auto">
        <FcStudyRequestBulkDetails
          v-model="studyRequestBulk"
          class="px-5"
          :is-create="false"
          :v="$v.studyRequestBulk" />
      </div>

      <footer class="flex-grow-0 flex-shrink-0 shading">
        <v-divider></v-divider>

        <div class="align-center d-flex px-3 py-2">
          <v-spacer></v-spacer>
          <FcButton
            class="mr-2"
            type="tertiary"
            @click="actionNavigateBack(false)">
            Cancel
          </FcButton>
          <FcButton
            :disabled="loadingSave"
            :loading="loadingSave"
            type="primary"
            @click="actionSave">
            Save
          </FcButton>
        </div>
      </footer>
    </template>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

import { getStudyRequestBulk } from '@/lib/api/WebApi';
import ValidationsStudyRequestBulk from '@/lib/validation/ValidationsStudyRequestBulk';
import FcProgressLinear from '@/web/components/dialogs/FcProgressLinear.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcStudyRequestBulkDetails
  from '@/web/components/requests/FcStudyRequestBulkDetails.vue';
import FcBreadcrumbsStudyRequest from '@/web/components/requests/nav/FcBreadcrumbsStudyRequest.vue';
import FcMixinRequestStudyLeaveGuard from '@/web/mixins/FcMixinRequestStudyLeaveGuard';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';
import { getFirstErrorText, scrollToFirstError } from '@/web/ui/FormUtils';

export default {
  name: 'FcDrawerRequestStudyBulkEdit2',
  mixins: [
    FcMixinRequestStudyLeaveGuard,
    FcMixinRouteAsync,
  ],
  components: {
    FcBreadcrumbsStudyRequest,
    FcButton,
    FcProgressLinear,
    FcStudyRequestBulkDetails,
  },
  data() {
    return {
      loadingSave: false,
      studyRequestBulk: null,
    };
  },
  computed: {
    formValid() {
      return !this.$v.$invalid;
    },
    routeNavigateBack() {
      if (this.studyRequestBulk === null) {
        return null;
      }
      return {
        name: 'requestStudyBulkView',
        params: { id: this.studyRequestBulk.id },
      };
    },
  },
  validations: {
    studyRequestBulk: ValidationsStudyRequestBulk,
  },
  methods: {
    actionSave() {
      if (!this.formValid) {
        const $form = this.$refs.formWrapper;
        scrollToFirstError($form, '.v-input');

        const errorText = getFirstErrorText($form);
        this.setToastError(errorText);
        return;
      }

      this.updateStudyRequestBulk(this.studyRequestBulk);
      this.actionNavigateBack(true);
    },
    async loadAsyncForRoute(to) {
      const { id } = to.params;
      const { studyRequestBulk } = await getStudyRequestBulk(id);
      await this.setStudyRequestsForStudyRequestBulk(studyRequestBulk);
      this.studyRequestBulk = studyRequestBulk;
    },
    ...mapMutations(['setToastError']),
    ...mapActions('editRequests', [
      'setStudyRequestsForStudyRequestBulk',
      'updateStudyRequestBulk',
    ]),
  },
};
</script>
