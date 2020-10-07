<template>
  <FcDialogConfirm
    v-model="internalValue"
    :text-cancel="isEdit ? 'Keep editing' : 'Stay in this mode'"
    :text-ok="isEdit ? 'Discard' : 'Quit'"
    :title="isEdit ? 'Discard multi-location changes?' : 'Quit multi-location mode?'"
    @action-ok="actionMultiLocationLeave">
    <div class="body-1">
      <span v-if="isEdit">
        You have made changes to the selected locations that have not been saved.
        Do you wish to discard these changes?
      </span>
      <span v-else>
        Leaving this mode and entering single-location mode will cause a loss of
        all selected locations except the first.  Are you sure you want to quit?
      </span>
    </div>
  </FcDialogConfirm>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { LocationMode } from '@/lib/Constants';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogConfirmMultiLocationLeave',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcDialogConfirm,
  },
  computed: {
    isEdit() {
      return this.locationMode === LocationMode.MULTI_EDIT;
    },
    ...mapState(['locationMode']),
  },
  methods: {
    actionMultiLocationLeave() {
      if (this.locationMode === LocationMode.MULTI_EDIT) {
        this.cancelLocationsEdit();
      } else if (this.locationMode === LocationMode.MULTI) {
        this.setLocationMode(LocationMode.SINGLE);
      }
    },
    ...mapMutations(['cancelLocationsEdit', 'setLocationMode']),
  },
};
</script>
