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
  name: 'FcActionBottomContinue',
  computed: {
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validationsMeta,
  methods: {
    onClickContinue() {
      let { name } = this.$route;
      name = name.replace('Schedule', 'Specify');
      this.$router.push({ name });
    },
  },
};
</script>
