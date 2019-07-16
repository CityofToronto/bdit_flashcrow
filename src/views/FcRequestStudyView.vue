<template>
<div class="fc-request-study-view">
  <h2>TRACK BY ID!</h2>
</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { HttpStatus } from '@/lib/Constants';
import {
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
} from '@/lib/i18n/Strings';

function getToast(err) {
  if (err.statusCode === HttpStatus.FORBIDDEN) {
    return REQUEST_STUDY_FORBIDDEN;
  }
  if (err.statusCode === HttpStatus.NOT_FOUND) {
    return REQUEST_STUDY_NOT_FOUND;
  }
  return {
    variant: 'error',
    text: err.message,
  };
}

export default {
  name: 'FcRequestStudyView',
  computed: {
    ...mapState(['studyRequest']),
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.syncFromRoute(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.syncFromRoute(to)
      .then(() => {
        next();
      }).catch((err) => {
        next(err);
      });
  },
  methods: {
    syncFromRoute(to) {
      const { id } = to.params;
      return this.fetchStudyRequest(id)
        .catch((err) => {
          const toast = getToast(err);
          this.setToast(toast);
        });
    },
    ...mapActions(['fetchStudyRequest', 'setToast']),
  },
};
</script>

<style lang="postcss">

</style>
