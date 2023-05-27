<template>
  <FcTextarea
    v-model="internalNotes"
    :error-messages="errorMessagesNotes"
    label="Notes"
    v-bind="$attrs"
    :rows="2"
    :optional="true"
    @blur="v.notes.$touch()" />
</template>

<script>
import { REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES } from '@/lib/i18n/Strings';
import FcTextarea from '@/web/components/inputs/FcTextarea.vue';

export default {
  name: 'FcStudyRequestNotes',
  components: {
    FcTextarea,
  },
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
    internalNotes: {
      get() {
        const notes = this.v.notes.$model;
        if (notes === null) {
          return '';
        }
        return notes;
      },
      set(internalNotes) {
        if (internalNotes === null) {
          this.v.notes.$model = '';
        } else {
          this.v.notes.$model = internalNotes;
        }
      },
    },
  },
};
</script>
