<template>
  <div>
    <FcSelectEnum
      v-model="v.studyType.$model"
      :error-messages="errorMessagesStudyType"
      :items="items"
      item-text="label"
      label="Study Type"
      :of-type="StudyType"
      outlined
      v-bind="$attrs" />

    <v-text-field
      v-if="v.studyType.$model.other"
      v-model="v.studyTypeOther.$model"
      class="mt-4"
      :error-messages="errorMessagesStudyTypeOther"
      hide-details="auto"
      label="Other Study Type"
      outlined
      :success="v.studyTypeOther.$model && !v.studyTypeOther.$invalid"
      v-bind="$attrs" />
  </div>
</template>

<script>
import { StudyType } from '@/lib/Constants';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';
import {
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER,
} from '@/lib/i18n/Strings';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';

export default {
  name: 'FcStudyRequestStudyType',
  components: {
    FcSelectEnum,
  },
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
    items() {
      return getLocationStudyTypes(this.location);
    },
  },
  watch: {
    'v.studyType.$model': function watchStudyType(studyType) {
      if (studyType.other) {
        this.v.studyTypeOther.$model = this.studyTypeOther;
      } else {
        this.studyTypeOther = this.v.studyType.$model;
        this.v.studyTypeOther.$model = null;
      }
    },
  },
};
</script>
