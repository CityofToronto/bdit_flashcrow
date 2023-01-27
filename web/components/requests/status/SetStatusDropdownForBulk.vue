<template>
  <SetStatusDropdown
    :disabled="noRequestsSelected || doStatusesDiffer || !isValidTransitions"
    :status-transitions="validStatusTransitions"
    :nRequests="nRequests"
    @transition-status="transitionStatus" />
</template>

<script>
import SetStatusDropdown from '@/web/components/requests/status/SetStatusDropdown.vue';
import SrStatusTransitionValidator from '@/lib/SrStatusTransitionValidator';
import { AuthScope } from '@/lib/Constants';
import _ from 'underscore';

export default {
  name: 'SetStatusDropdownForBulk',
  components: {
    SetStatusDropdown,
  },
  props: {
    studyRequests: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    studyRequestStatuses() {
      return _.uniq(this.studyRequests.map(sr => sr.status));
    },
    doStatusesDiffer() {
      return this.studyRequestStatuses.length > 1;
    },
    nRequests() {
      return this.studyRequests.length;
    },
    noRequestsSelected() {
      return this.nRequests === 0;
    },
    transitionValidator() {
      return new SrStatusTransitionValidator([AuthScope.STUDY_REQUESTS_ADMIN]);
    },
    validStatusTransitions() {
      let transitions = [];
      if (!this.noRequestsSelected && !this.doStatusesDiffer) {
        transitions = this.transitionValidator.getRulesForScope(this.currentStatus);
      }
      return transitions;
    },
    isValidTransitions() {
      return this.validStatusTransitions.length > 0;
    },
    currentStatus() {
      let status = false;
      if (!this.doStatusesDiffer) [status] = this.studyRequestStatuses;
      return status;
    },
  },
  methods: {
    transitionStatus(nextStatus) {
      this.$emit('transition-status', nextStatus);
    },
  },
};
</script>
