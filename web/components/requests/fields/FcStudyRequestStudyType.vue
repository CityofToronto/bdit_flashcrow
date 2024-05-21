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

    <template v-if="v.studyType.$model !== null && v.studyType.$model.other">
      <v-text-field
        v-model="v.studyTypeOther.$model"
        class="mt-4"
        :error-messages="errorMessagesStudyTypeOther"
        hide-details="auto"
        label="Other Study Type"
        outlined
        :success="v.studyTypeOther.$model && !v.studyTypeOther.$invalid"
        v-bind="$attrs" />
    </template>
  </div>
</template>

<script>
import { StudyType, CentrelineType } from '@/lib/Constants';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';
import {
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER,
} from '@/lib/i18n/Strings';

function toInternalStudyType(studyType) {
  if (studyType === null) {
    return null;
  }
  return studyType.name;
}

function fromInternalStudyType(internalStudyType) {
  if (internalStudyType === null) {
    return null;
  }
  return StudyType.enumValueOf(internalStudyType);
}

export default {
  name: 'FcStudyRequestStudyType',
  props: {
    location: Object,
    v: Object,
  },
  data() {
    return {
      studyTypeOther: null,
      StudyType,
    };
  },
  mounted() {
    let studyType;
    if (this.location.centrelineType === CentrelineType.INTERSECTION) {
      studyType = StudyType.TMC;
    } else {
      studyType = StudyType.ATR_SVC;
    }
    this.studyType = studyType;
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
        this.v.studyType.$model = fromInternalStudyType(internalStudyType);
      },
    },
    itemsStudyType() {
      const locationStudyTypes = getLocationStudyTypes(this.location);
      return [
        ...locationStudyTypes.map(({ label, name }) => ({ text: label, value: name })),
        { text: 'Other', value: 'OTHER' },
      ];
    },
  },
  watch: {
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
