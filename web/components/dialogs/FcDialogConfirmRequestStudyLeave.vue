<template>
  <FcDialogConfirm
      v-model="internalValue"
      :textCancel="isCreate ? 'Stay on this page' : 'Keep editing'"
      :textOk="isCreate ? 'Quit' : 'Discard'"
      :title="isCreate ? 'Quit study request?' : 'Discard changes?'"
      @action-ok="$emit('action-ok')">
      <span class="body-1">
        <span v-if="isCreate">
          Leaving this page will cause a loss of all entered data.
          Are you sure you want to quit?
        </span>
        <span v-else>
          You have made changes to the study request that have not been saved.
          Do you wish to discard these changes?
        </span>
      </span>
    </FcDialogConfirm>
</template>

<script>

import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogConfirmRequestStudyLeave',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogConfirm,
  },
  props: {
    isCreate: Boolean,
  },
};
</script>
