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
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    linkFinish() {
      if (this.studyRequest.id !== undefined) {
        // coming from edit flow
        const { id } = this.studyRequest;
        const route = {
          name: 'requestStudyView',
          params: { id },
        };
        if (this.isSupervisor) {
          route.query = { isSupervisor: true };
        }
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
      const { isSupervisor, studyRequest } = this;
      this.saveStudyRequest({ isSupervisor, studyRequest });
      this.$router.push(this.linkFinish.route);
    },
    ...mapActions(['saveStudyRequest']),
  },
};
</script>
