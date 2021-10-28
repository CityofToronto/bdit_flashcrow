<template>
  <v-dialog
    v-model="internalValue"
    max-width="336"
    scrollable>
    <v-card
      aria-labelledby="heading_dialog_request_filters"
      role="dialog">
      <v-card-title class="shading">
        <h2 class="display-1" id="heading_dialog_request_filters">
          Filter Requests
        </h2>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="default--text">
        <fieldset class="mt-4">
          <legend class="headline">Study Types</legend>

          <template v-for="studyType in StudyType.enumValues">
            <v-checkbox
              v-if="!studyType.other"
              :key="studyType.name"
              v-model="internalFilters.studyTypes"
              class="mt-2"
              hide-details
              :label="studyType.label"
              :value="studyType"></v-checkbox>
          </template>
          <v-checkbox
            v-model="internalFilters.studyTypeOther"
            class="mt-2"
            hide-details
            label="Other"></v-checkbox>
        </fieldset>

        <fieldset class="mt-6">
          <legend class="headline">Status</legend>

          <v-checkbox
            v-for="status in StudyRequestStatus.enumValues"
            :key="status.name"
            v-model="internalFilters.statuses"
            class="mt-2"
            hide-details
            :label="status.text"
            :value="status"></v-checkbox>
        </fieldset>

        <fieldset class="mt-6">
          <legend class="headline">Assignee</legend>

          <v-checkbox
            v-model="internalFilters.assignees"
            class="mt-2"
            hide-details
            label="Unassigned"
            :value="null"></v-checkbox>
          <v-checkbox
            v-for="assignee in StudyRequestAssignee.enumValues"
            :key="assignee.name"
            v-model="internalFilters.assignees"
            class="mt-2"
            hide-details
            :label="assignee.text"
            :value="assignee"></v-checkbox>
        </fieldset>

        <FcRadioGroup
          v-model="internalFilters.userOnly"
          class="mt-6"
          hide-details
          :items="[
            { label: 'Requested by me', value: true },
            { label: 'All', value: false },
          ]"
          label="Requester" />

        <fieldset class="mt-6">
          <legend class="headline">Date Requested</legend>

          <FcDatePicker
            v-model="$v.internalFilters.createdAtStart.$model"
            class="mt-2"
            :error-messages="errorMessagesCreatedAtStart"
            hide-details="auto"
            label="From (YYYY-MM-DD)"
            :max="now">
          </FcDatePicker>
          <FcDatePicker
            v-model="$v.internalFilters.createdAtEnd.$model"
            class="mt-2"
            :error-messages="errorMessagesCreatedAtEnd"
            hide-details="auto"
            label="To (YYYY-MM-DD)"
            :max="now">
          </FcDatePicker>
        </fieldset>

        <fieldset class="mt-6">
          <legend class="headline">Date Expected</legend>

          <v-checkbox
            v-model="internalFilters.urgent"
            class="mt-2"
            hide-details
            label="Urgent Request"></v-checkbox>
          <FcDatePicker
            v-model="$v.internalFilters.dueDateStart.$model"
            class="mt-2"
            :error-messages="errorMessagesDueDateStart"
            hide-details="auto"
            label="From (YYYY-MM-DD)">
          </FcDatePicker>
          <FcDatePicker
            v-model="$v.internalFilters.dueDateEnd.$model"
            class="mt-2"
            :error-messages="errorMessagesDueDateEnd"
            hide-details="auto"
            label="To (YYYY-MM-DD)">
          </FcDatePicker>
        </fieldset>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
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
import { mapState } from 'vuex';

import {
  StudyRequestAssignee,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import { defaultStudyRequestFilters } from '@/lib/filters/DefaultFilters';
import ValidationsStudyRequestFilters from '@/lib/validation/ValidationsStudyRequestFilters';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

function cloneStudyRequestFilters(filters) {
  const {
    assignees,
    createdAtStart,
    createdAtEnd,
    dueDateStart,
    dueDateEnd,
    statuses,
    studyTypes,
    studyTypeOther,
    userOnly,
    urgent,
  } = filters;
  return {
    assignees: [...assignees],
    createdAtStart,
    createdAtEnd,
    dueDateStart,
    dueDateEnd,
    statuses: [...statuses],
    studyTypes: [...studyTypes],
    studyTypeOther,
    userOnly,
    urgent,
  };
}

export default {
  name: 'FcDialogRequestFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcDatePicker,
    FcRadioGroup,
  },
  props: {
    filters: Object,
  },
  data() {
    return {
      internalFilters: cloneStudyRequestFilters(this.filters),
      StudyRequestAssignee,
      StudyRequestStatus,
      StudyType,
    };
  },
  computed: {
    errorMessagesCreatedAtStart() {
      const errors = [];
      if (!this.$v.internalFilters.createdAtStart.startBeforeEnd) {
        errors.push('From date must be before to date.');
      }
      return errors;
    },
    errorMessagesCreatedAtEnd() {
      const errors = [];
      if (!this.$v.internalFilters.createdAtEnd.startBeforeEnd) {
        errors.push('From date must be before to date.');
      }
      return errors;
    },
    errorMessagesDueDateStart() {
      const errors = [];
      if (!this.$v.internalFilters.dueDateStart.startBeforeEnd) {
        errors.push('From date must be before to date.');
      }
      return errors;
    },
    errorMessagesDueDateEnd() {
      const errors = [];
      if (!this.$v.internalFilters.dueDateEnd.startBeforeEnd) {
        errors.push('From date must be before to date.');
      }
      return errors;
    },
    ...mapState(['now']),
  },
  validations: {
    internalFilters: ValidationsStudyRequestFilters,
  },
  methods: {
    actionClearAll() {
      this.internalFilters = defaultStudyRequestFilters();
    },
    actionSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
