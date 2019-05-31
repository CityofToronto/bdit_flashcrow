<template>
  <button
    class="tds-button-primary"
    @click="onClickContinue">
    Continue
  </button>
</template>

<script>
import { mapState } from 'vuex';

// import validations from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcActionBottomContinue',
  computed: {
    ...mapState(['studyRequest']),
  },
  methods: {
    onClickContinue() {
      this.$router.push({ name: 'requestStudyConfirm' });
    },
  },
};
</script>

<style lang="postcss">

</style>
