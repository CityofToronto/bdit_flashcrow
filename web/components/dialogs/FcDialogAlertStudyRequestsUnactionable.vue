<template>
  <FcDialogAlert
    v-model="internalValue"
    :title="title">
    <p class="body-1">
      {{studyRequestsUnactionable.length}} of {{studyRequests.length}}
      requests could not be {{actionVerbPastTense}} due to their status:
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
import FcDialogAlert from '@/web/components/dialogs/FcDialogAlert.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogAlertStudyRequestsUnactionable',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogAlert,
  },
  props: {
    actionVerb: String,
    actionVerbPastTense: String,
    studyRequests: Array,
    studyRequestsUnactionable: Array,
  },
  computed: {
    title() {
      const { actionVerb } = this;
      return `Could not ${actionVerb} all requests`;
    },
  },
};
</script>
