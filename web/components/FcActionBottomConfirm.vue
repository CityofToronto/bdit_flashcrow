<template>
  <button
    class="tds-button-primary"
    :disabled="$v.$invalid"
    @click="onClickConfirm">
    {{linkFinish.label}}
  </button>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';

export default {
  name: 'FcActionBottomConfirm',
  computed: {
    linkFinish() {
      if (this.studyRequest.id !== undefined) {
        // coming from edit flow
        const { id } = this.studyRequest;
        const route = {
          name: 'requestStudyView',
          params: { id },
        };
        const label = 'Save';
        return { route, label };
      }
      // coming from view flow
      const { centrelineId, centrelineType } = this.location;
      const route = {
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      };
      const label = 'Confirm';
      return { route, label };
    },
    ...mapState(['location', 'studyRequest']),
  },
  validations: ValidationsStudyRequest.validations,
  methods: {
    onClickConfirm() {
      this.saveActiveStudyRequest();
      this.$router.push(this.linkFinish.route);
    },
    ...mapActions(['saveActiveStudyRequest']),
  },
};
</script>
