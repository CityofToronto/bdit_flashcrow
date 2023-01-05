<template>
  <FcDialogAlert
    v-model="internalValue"
    :title="title">
    <p class="body-1">
      {{bodyText}}
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
    bodyText() {
      let text = `This request cannot be transitioned to "${this.status.text}" from its current status:`;
      if (this.isMultipleRequests) {
        text = `${this.nUnactionable} of ${this.nRequests} requests cannot be updated to "${this.status.text}" from their current status:`;
      }
      return text;
    },
    title() {
      let title = 'Cannot update request';
      if (this.isMultipleRequests) title += 's';
      return title;
    },
    isMultipleRequests() {
      return this.nRequests > 1;
    },
  },
};
</script>
