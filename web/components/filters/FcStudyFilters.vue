<template>
  <div>
    <fieldset class="mt-4">
      <legend class="headline">Study Types</legend>

      <template v-for="studyType in StudyType.enumValues">
        <template v-if="studyType.dataAvailable">
          <v-checkbox
            :key="studyType.name"
            v-model="internalValue.studyTypes"
            class="mt-2"
            hide-details
            :label="studyType.label"
            :value="studyType" />
          <div
            v-if="studyType.beta !== null"
            :key="studyType.name + '_beta'"
            class="ml-2">
            <FcTextStudyTypeBeta
              class="ml-12"
              :study-type="studyType" />
          </div>
        </template>
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
import FcTextStudyTypeBeta from '@/web/components/data/FcTextStudyTypeBeta.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcTextStudyTypeBeta,
  },
  data() {
    return {
      StudyHours,
      StudyType,
    };
  },
};
</script>
