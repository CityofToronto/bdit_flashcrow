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
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validationsMeta,
  methods: {
    onClickContinue() {
      let { name } = this.$route;
      name = name.replace('Schedule', 'Specify');
      const route = { name };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      this.$router.push(route);
    },
  },
};
</script>
