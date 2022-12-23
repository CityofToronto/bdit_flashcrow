<template>
  <FcDialogAlert
    v-model="internalValue"
    :title="title">
    <p class="body-1">
      {{studyRequestsUnactionable.length}} of {{studyRequests.length}}
      requests could not be {{status.text}} due to their status:
    </p>
    <ul class="body-1">
      <li
        v-for="({ id, status }) in studyRequestsUnactionable"
        :key="id">
        <span>Study Request #{{id}}:</span>
        <v-icon :color="status.color">mdi-circle-medium</v-icon>
        <span>{{status.text}}</span>
      </li>
    </ul>
  </FcDialogAlert>
</template>

<script>
import { StudyRequestStatus } from '@/lib/Constants';
import FcDialogAlert from '@/web/components/dialogs/FcDialogAlert.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogAlertStudyRequestsUnactionable',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogAlert,
  },
  props: {
    status: StudyRequestStatus,
    studyRequests: Array,
    studyRequestsUnactionable: Array,
  },
  computed: {
    title() {
      return `Could not ${this.status.textVerb} all requests`;
    },
  },
};
</script>
