<template>
  <FcSelectEnum
    v-model="v.studyType.$model"
    :error-messages="errorMessagesStudyType"
    :items="items"
    item-text="label"
    label="Study Type"
    :of-type="StudyType"
    outlined
    v-bind="$attrs" />
</template>

<script>
import { StudyType } from '@/lib/Constants';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';
import { REQUEST_STUDY_REQUIRES_STUDY_TYPE } from '@/lib/i18n/Strings';
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
    return { StudyType };
  },
  computed: {
    errorMessagesStudyType() {
      const errors = [];
      if (!this.v.studyType.required) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDY_TYPE.text);
      }
      return errors;
    },
    items() {
      return getLocationStudyTypes(this.location);
    },
  },
};
</script>
