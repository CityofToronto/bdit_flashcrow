<template>
  <FcDialogAlert
    v-model="internalValue"
    title="Could not set study type for all requests">
    <p class="body-1">
      {{indicesUnactionable.length}} of {{locations.length}}
      requests could not have their study type set to {{studyType.label}}
      due to the type of road:
    </p>
    <ul class="body-1">
      <li
        v-for="i in indicesUnactionable"
        :key="i">
        <span>{{locations[i].description}}: </span>
        <span>{{locationsFeatureTypes[i].description}}</span>
      </li>
    </ul>
  </FcDialogAlert>
</template>

<script>
import { StudyType } from '@/lib/Constants';
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';
import FcDialogAlert from '@/web/components/dialogs/FcDialogAlert.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogAlertStudyTypeUnactionable',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogAlert,
  },
  props: {
    indicesUnactionable: Array,
    locations: Array,
    studyType: StudyType,
  },
  computed: {
    locationsFeatureTypes() {
      return this.locations.map(getLocationFeatureType);
    },
  },
};
</script>
