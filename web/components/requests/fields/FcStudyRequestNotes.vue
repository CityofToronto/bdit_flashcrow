<template>
  <v-textarea
    v-model="v.notes.$model"
    :error-messages="errorMessagesNotes"
    label="Additional Information"
    :messages="messagesNotes"
    no-resize
    outlined
    rows="4"
    v-bind="$attrs"
    @blur="v.notes.$touch()"></v-textarea>
</template>

<script>
import { StudyHours } from '@/lib/Constants';
import { OPTIONAL, REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES } from '@/lib/i18n/Strings';

export default {
  name: 'FcStudyRequestNotes',
  props: {
    v: Object,
  },
  computed: {
    errorMessagesNotes() {
      const errors = [];
      if (!this.v.notes.requiredIfOtherHours) {
        errors.push(REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES.text);
      }
      return errors;
    },
    messagesNotes() {
      const hours = this.v.hours.$model;
      if (hours === StudyHours.OTHER) {
        return [];
      }
      return [OPTIONAL.text];
    },
  },
};
</script>
