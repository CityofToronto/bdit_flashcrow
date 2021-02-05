<template>
  <div>
    <FcSelectEnum
      v-model="v.reason.$model"
      :error-messages="errorMessagesReason"
      hide-details="auto"
      label="Reason for Request"
      :of-type="StudyRequestReason"
      outlined />

    <v-text-field
      v-if="v.reason.$model === StudyRequestReason.OTHER"
      v-model="v.reasonOther.$model"
      class="mt-4"
      :error-messages="errorMessagesReasonOther"
      hide-details="auto"
      label="Other Reason"
      outlined
      :success="v.reasonOther.$model && !v.reasonOther.$invalid" />
  </div>
</template>

<script>
import { StudyRequestReason } from '@/lib/Constants';
import {
  REQUEST_STUDY_REQUIRES_REASON,
  REQUEST_STUDY_REQUIRES_REASON_OTHER,
} from '@/lib/i18n/Strings';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';

export default {
  name: 'FcStudyRequestReason',
  components: {
    FcSelectEnum,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      reasonOther: null,
      StudyRequestReason,
    };
  },
  computed: {
    errorMessagesReason() {
      const errors = [];
      if (!this.v.reason.required) {
        errors.push(REQUEST_STUDY_REQUIRES_REASON.text);
      }
      return errors;
    },
    errorMessagesReasonOther() {
      const errors = [];
      if (!this.v.reasonOther.requiredIfOtherReason) {
        errors.push(REQUEST_STUDY_REQUIRES_REASON_OTHER.text);
      }
      return errors;
    },
  },
  watch: {
    'v.reason.$model': function watchReason(reason) {
      if (reason === StudyRequestReason.OTHER) {
        this.v.reasonOther.$model = this.reasonOther;
      } else {
        this.reasonOther = this.v.reasonOther.$model;
        this.v.reasonOther.$model = null;
      }
    },
  },
};
</script>
