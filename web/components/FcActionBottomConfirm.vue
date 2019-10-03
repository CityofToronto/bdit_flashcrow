<template>
  <button
    class="tds-button-primary"
    :disabled="$v.$invalid"
    @click="onClickConfirm">
    Confirm
  </button>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcActionBottomConfirm',
  computed: {
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validations,
  methods: {
    onClickConfirm() {
      this.saveActiveStudyRequest();
      this.$router.push({ name: 'viewData' });
    },
    ...mapActions(['saveActiveStudyRequest']),
  },
};
</script>
