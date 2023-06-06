<template>
  <v-dialog
    v-model="internalValue"
    max-width="560"
    persistent
    scrollable>
    <v-card
      aria-labelledby="heading_dialog_project_mode"
      role="dialog">
      <v-card-title class="shading">
        <h2 class="display-1" id="heading_dialog_project_mode">
          {{title}}
        </h2>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="default--text">
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
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="actionCancel">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.$invalid"
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ProjectMode } from '@/lib/Constants';
import { makeStudyRequestBulk } from '@/lib/requests/RequestEmpty';
import ValidationsStudyRequestBulk from '@/lib/validation/ValidationsStudyRequestBulk';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcInputProjectSearch from '@/web/components/inputs/FcInputProjectSearch.vue';
import FcStudyRequestBulkDetails
  from '@/web/components/requests/FcStudyRequestBulkDetails.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogProjectMode',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcInputProjectSearch,
    FcStudyRequestBulkDetails,
  },
  props: {
    projectMode: ProjectMode,
    studyRequests: Array,
  },
  data() {
    return {
      ProjectMode,
      studyRequestBulk: makeStudyRequestBulk(),
    };
  },
  validations: {
    studyRequestBulk: ValidationsStudyRequestBulk,
  },
  computed: {
    errorMessagesAddToProject() {
      if (this.$v.studyRequestBulk.$invalid) {
        return ['Please select an existing project to add these requests to'];
      }
      return [];
    },
    title() {
      if (this.projectMode === ProjectMode.CREATE_NEW) {
        return 'New Project';
      }
      if (this.projectMode === ProjectMode.ADD_TO_EXISTING) {
        return 'Add to Existing Project';
      }
      return null;
    },
  },
  methods: {
    actionCancel() {
      this.$emit('action-cancel');
      this.internalValue = false;
    },
    actionSave() {
      this.$emit('action-save', this.studyRequestBulk);
      this.studyRequestBulk = makeStudyRequestBulk();
      this.internalValue = false;
    },
  },
};
</script>
