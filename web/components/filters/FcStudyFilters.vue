<template>
  <div>
    <fieldset class="mt-4">
      <legend class="headline">Study Types</legend>

      <template v-for="studyType in StudyType.enumValues">
        <v-checkbox
          v-if="studyType.dataAvailable"
          :key="studyType.name"
          v-model="internalValue.studyTypes"
          class="mt-2"
          hide-details
          :label="studyType.label"
          :value="studyType"></v-checkbox>
      </template>
    </fieldset>

    <fieldset class="mt-6">
      <legend class="headline">Hours</legend>

      <v-checkbox
        v-for="studyHours in StudyHours.enumValues"
        :key="studyHours.name"
        v-model="internalValue.hours"
        class="mt-2"
        hide-details
        :label="studyHours.description"
        :value="studyHours"></v-checkbox>
    </fieldset>
  </div>
</template>

<script>
import {
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyFilters',
  mixins: [FcMixinVModelProxy(Object)],
  data() {
    return {
      StudyHours,
      StudyType,
    };
  },
};
</script>
