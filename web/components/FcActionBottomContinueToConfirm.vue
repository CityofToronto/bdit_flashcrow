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
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validations,
  methods: {
    onClickContinue() {
      let { name } = this.$route;
      name = name.replace('Specify', 'Confirm');
      const route = { name };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      this.$router.push(route);
    },
  },
};
</script>
