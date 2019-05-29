<template>
  <button
    class="tds-button-primary"
    @click="onClickContinue"
    :disabled="$v.$invalid">
    Continue
  </button>
</template>

<script>
import { mapState } from 'vuex';

import validations from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcActionBottomContinue',
  computed: {
    ...mapState(['studyRequest']),
  },
  validations,
  methods: {
    onClickContinue() {
      this.$router.push({ name: 'requestStudyConfirm' });
    },
  },
};
</script>

<style lang="postcss">

</style>
