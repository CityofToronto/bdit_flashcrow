<template>
  <button
    class="tds-button-primary"
    :disabled="$v.$invalid"
    @click="onClickConfirm">
    Confirm
  </button>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcActionBottomConfirm',
  computed: {
    ...mapState(['studyRequest']),
  },
  validations: ValidationsStudyRequest.validations,
  methods: {
    onClickConfirm() {
      // TODO: save request, send confirmation email
      this.$router.push({ name: 'viewData' });
      this.setModal({
        component: 'FcModalRequestStudyConfirmation',
        data: {},
      });
    },
    ...mapMutations(['setModal']),
  },
};
</script>

<style lang="postcss">

</style>
