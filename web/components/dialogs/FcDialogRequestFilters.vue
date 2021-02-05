<template>
  <v-dialog
    v-model="internalValue"
    max-width="336"
    scrollable>
    <v-card role="dialog">
      <v-card-title>
        <h2 class="headline">Filter Requests</h2>
      </v-card-title>
      <v-card-text>
        <h2 class="body-1 mt-4">Study Types</h2>
        <v-checkbox
          v-for="studyType in StudyType.enumValues"
          :key="studyType.name"
          v-model="internalStudyTypes"
          class="mt-2"
          hide-details
          :label="studyType.label"
          :value="studyType"></v-checkbox>

        <h2 class="body-1 mt-4">Status</h2>
        <v-checkbox
          v-for="status in StudyRequestStatus.enumValues"
          :key="status.name"
          v-model="internalStatuses"
          class="mt-2"
          hide-details
          :label="status.text"
          :value="status"></v-checkbox>
        <v-checkbox
          v-model="internalClosed"
          class="mt-2"
          hide-details
          label="Closed"></v-checkbox>

        <h2 class="body-1 mt-4">Assigned To</h2>
        <v-checkbox
          v-model="internalAssignees"
          class="mt-2"
          hide-details
          label="None"
          :value="null"></v-checkbox>
        <v-checkbox
          v-for="assignee in StudyRequestAssignee.enumValues"
          :key="assignee.name"
          v-model="internalAssignees"
          class="mt-2"
          hide-details
          :label="assignee.text"
          :value="assignee"></v-checkbox>

        <FcRadioGroup
          v-model="internalCreatedAt"
          class="mt-4"
          hide-details
          :items="[
            { label: 'Less than 1 month ago', value: -1 },
            { label: 'Less than 3 months ago', value: -3 },
            { label: 'At least 3 months ago', value: 3 },
            { label: 'All', value: 0 },
          ]">
          <template v-slot:legend>
            <h2 class="body-1 secondary--text">Date Created</h2>
          </template>
        </FcRadioGroup>

        <FcRadioGroup
          v-model="internalLastEditedAt"
          class="mt-4"
          hide-details
          :items="[
            { label: 'Less than 1 month ago', value: -1 },
            { label: 'Less than 3 months ago', value: -3 },
            { label: 'At least 3 months ago', value: 3 },
            { label: 'All', value: 0 },
          ]">
          <template v-slot:legend>
            <h2 class="body-1 secondary--text">Last Updated</h2>
          </template>
        </FcRadioGroup>

        <FcRadioGroup
          v-model="internalUserOnly"
          class="mt-4"
          hide-details
          :items="[
            { label: 'All', value: false },
            { label: 'User', value: true },
          ]">
          <template v-slot:legend>
            <h2 class="body-1 secondary--text">Requester</h2>
          </template>
        </FcRadioGroup>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          Cancel
        </FcButton>
        <FcButton
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  StudyRequestAssignee,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogRequestFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcRadioGroup,
  },
  props: {
    assignees: Array,
    closed: Boolean,
    createdAt: Number,
    lastEditedAt: Number,
    statuses: Array,
    studyTypes: Array,
    userOnly: Boolean,
  },
  data() {
    return {
      internalAssignees: this.assignees,
      internalClosed: this.closed,
      internalCreatedAt: this.createdAt,
      internalLastEditedAt: this.lastEditedAt,
      internalStatuses: this.statuses,
      internalStudyTypes: this.studyTypes,
      internalUserOnly: this.userOnly,
      StudyRequestAssignee,
      StudyRequestStatus,
      StudyType,
    };
  },
  computed: {
    internalFilters() {
      return {
        assignees: this.internalAssignees,
        closed: this.internalClosed,
        createdAt: this.internalCreatedAt,
        lastEditedAt: this.internalLastEditedAt,
        statuses: this.internalStatuses,
        studyTypes: this.internalStudyTypes,
        userOnly: this.internalUserOnly,
      };
    },
  },
  methods: {
    actionSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
