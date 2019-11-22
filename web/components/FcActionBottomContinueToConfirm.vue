<template>
  <button
    class="tds-button-primary"
    :disabled="$v.$invalid"
    @click="onClickContinue">
    Continue
  </button>
</template>

<script>
import { mapState } from 'vuex';

import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcActionBottomContinueToConfirm',
  computed: {
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validations,
  methods: {
    onClickContinue() {
      let { name } = this.$route;
      name = name.replace('Specify', 'Confirm');
      this.$router.push({ name });
    },
  },
};
</script>
