<template>
  <div>
    <v-tooltip top v-model="showTooltip">
      <template v-slot:activator="{ attrs }">
        <div v-bind="attrs"
          @mouseenter="isHovering = !isHovering"
          @mouseleave="isHovering = !isHovering">
          <FcButton
            class="ml-2"
            type="secondary"
            :disabled="disabled"
            @click="showDialog = true">
            CANCEL
          </FcButton>
        </div>
      </template>
      <span class="no-cancel">{{ tooltipText }}</span>
    </v-tooltip>
    <CancelStudyRequestConfirmDialog
      :showDialog="showDialog"
      :nRequests="nRequests"
      @cancelConfirmed="cancel"
      @close="showDialog = false"
    />
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import CancelStudyRequestConfirmDialog from '@/web/components/dialogs/CancelStudyRequestConfirmDialog.vue';

export default {
  name: 'CancelRequestButton',
  components: {
    FcButton,
    CancelStudyRequestConfirmDialog,
  },
  data() {
    return {
      showDialog: false,
      isHovering: false,
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
    nRequests: {
      type: Number,
      default: 1,
    },
    projectContext: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    showTooltip() {
      return this.isHovering && this.disabled && this.areRequestsSelected;
    },
    tooltipText() {
      const nonProject = `You cannot cancel a request that has been dispatched for
        collection. If you have questions, please comment below or contact
        TrafficData@toronto.ca.`;
      const project = `You selected one or more requests that are dispatched
        for collection or were requested by other staff, and cannot be cancelled. To
        cancel, please change your selection or contact TrafficData@toronto.ca.`;
      return this.projectContext ? project : nonProject;
    },
    areRequestsSelected() {
      return this.nRequests !== 0;
    },
  },
  methods: {
    cancel() {
      this.showDialog = false;
      this.$emit('cancel-request');
    },
  },
};
</script>

<style lang="scss">
.v-tooltip__content {
  max-width: 350px !important;
}
</style>
