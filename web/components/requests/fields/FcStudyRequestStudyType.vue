<template>
  <div>
    <v-select
      v-model="internalStudyType"
      :error-messages="errorMessagesStudyType"
      hide-details="auto"
      :items="itemsStudyType"
      label="Study Type"
      :of-type="StudyType"
      outlined
      v-bind="$attrs" />

    <template
      v-if="v.studyType.$model !== null && v.studyType.$model.other"
      class="mt-4">
      <v-text-field
        v-model="v.studyTypeOther.$model"
        class="mt-4"
        :error-messages="errorMessagesStudyTypeOther"
        hide-details="auto"
        label="Other Study Type"
        outlined
        :success="v.studyTypeOther.$model && !v.studyTypeOther.$invalid"
        v-bind="$attrs" />
      <FcRadioGroup
        v-model="automaticOther"
        class="mt-2"
        hide-details
        :items="[
          {
            hint: 'Data is collected manually by on-site staff or contractors.',
            label: 'Manual',
            value: false,
          },
          {
            hint: 'Data is collected by tubes, cameras, radar, or similar automated equipment.',
            label: 'Automatic',
            value: true,
          },
        ]"
        label="Data Collection Method"
        v-bind="$attrs" />
    </template>
  </div>
</template>

<script>
import { StudyType } from '@/lib/Constants';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';
import {
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER,
} from '@/lib/i18n/Strings';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';

const INTERNAL_STUDY_TYPE_OTHER = 'OTHER';

function toInternalStudyType(studyType) {
  if (studyType === null) {
    return null;
  }
  if (studyType.other) {
    return INTERNAL_STUDY_TYPE_OTHER;
  }
  return studyType.name;
}

function fromInternalStudyType(internalStudyType, automaticOther) {
  if (internalStudyType === null) {
    return null;
  }
  if (internalStudyType === INTERNAL_STUDY_TYPE_OTHER) {
    return automaticOther ? StudyType.OTHER_AUTOMATIC : StudyType.OTHER_MANUAL;
  }
  return StudyType.enumValueOf(internalStudyType);
}

export default {
  name: 'FcStudyRequestStudyType',
  components: {
    FcRadioGroup,
  },
  props: {
    location: Object,
    v: Object,
  },
  data() {
    return {
      automaticOther: false,
      studyTypeOther: null,
      StudyType,
    };
  },
  computed: {
    errorMessagesStudyType() {
      const errors = [];
      if (!this.v.studyType.required) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDY_TYPE.text);
      }
      return errors;
    },
    errorMessagesStudyTypeOther() {
      const errors = [];
      if (!this.v.studyTypeOther.requiredIfOtherStudyType) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER.text);
      }
      return errors;
    },
    internalStudyType: {
      get() {
        return toInternalStudyType(this.v.studyType.$model);
      },
      set(internalStudyType) {
        this.v.studyType.$model = fromInternalStudyType(
          internalStudyType,
          this.automaticOther,
        );
      },
    },
    itemsStudyType() {
      const locationStudyTypes = getLocationStudyTypes(this.location);
      return [
        ...locationStudyTypes.map(({ label, name }) => ({ text: label, value: name })),
        { text: 'Other', value: INTERNAL_STUDY_TYPE_OTHER },
      ];
    },
  },
  watch: {
    automaticOther() {
      this.v.studyType.$model = fromInternalStudyType(
        this.internalStudyType,
        this.automaticOther,
      );
    },
    'v.studyType.$model.other': function watchStudyTypeOther(other) {
      if (other) {
        this.v.studyTypeOther.$model = this.studyTypeOther;
      } else {
        this.studyTypeOther = this.v.studyTypeOther.$model;
        this.v.studyTypeOther.$model = null;
      }
    },
  },
};
</script>
