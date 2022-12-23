<template>
  <FcDialogAlert
    v-model="internalValue"
    :title="'Status transition invalid'">
    <p class="body-1">
      {{nUnactionable}} of {{nRequests}} requests couldn't
      be transitioned to {{status.text}} from their curent status:
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
    studyRequestsUnactionable: Array,
    status: StudyRequestStatus,
    nRequests: Number,
  },
  computed: {
    nUnactionable() {
      return this.studyRequestsUnactionable.length;
    },
  },
};
</script>
