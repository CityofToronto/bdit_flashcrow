<template>
  <button
    class="tds-button-primary"
    @click="onClickConfirm">
    Confirm
  </button>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

// import validations from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcActionBottomConfirm',
  computed: {
    ...mapState(['studyRequest']),
  },
  methods: {
    onClickConfirm() {
      this.$router.push({ name: 'home' });
      this.setModal({
        component: 'FcModalRequestStudyConfirmation',
        data: this.studyRequest,
      });
    },
    ...mapMutations(['setModal']),
  },
};
</script>

<style lang="postcss">

</style>
