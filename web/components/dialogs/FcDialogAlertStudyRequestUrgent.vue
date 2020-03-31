<template>
  <FcDialogAlert
    v-model="internalValue"
    :title="title">
    <span class="body-1">
      You have requested an urgent study request,
      please wait for an email from
      <strong>trafficdata@toronto.ca</strong>
      for further instructions.
    </span>
  </FcDialogAlert>
</template>

<script>
import FcDialogAlert from '@/web/components/dialogs/FcDialogAlert.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogAlertStudyRequestUrgent',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogAlert,
  },
  props: {
    update: Boolean,
  },
  computed: {
    title() {
      return this.update ? 'Study request updated' : 'Study request sent';
    },
  },
};
</script>
