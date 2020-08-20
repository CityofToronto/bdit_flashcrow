<template>
  <FcDialogAlert
    v-model="internalValue"
    title="MOVE's In Development!">
    <div class="body-1">
      <p>
        Right now, we’re building a big new feature and releasing it here piece by piece.
        We expect parts of the application to break.  We’re hoping to have a more stable
        version of MOVE out soon that you can use without things breaking.  In the meantime,
        please bear with us!
      </p>

      <p>
        We do our best to make MOVE available on weekdays from 8:30am–6:00pm, but we can’t
        guarantee this while we are still building the application.
      </p>

      <p>
        If you have questions, please reach out to the MOVE Team at
        <a href="mailto:move-team@toronto.ca">move-team@toronto.ca</a>.
      </p>
    </div>
  </FcDialogAlert>
</template>

<script>
import FcDialogAlert from '@/web/components/dialogs/FcDialogAlert.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogAlertInDevelopment',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogAlert,
  },
};
</script>
