<template>
  <v-tooltip top v-model="showTooltip">
    <template v-slot:activator="{ attrs }">
      <div v-bind="attrs" class="set-status-dropdown"
        @mouseenter="isHovering = !isHovering"
        @mouseleave="isHovering = !isHovering">
        <v-menu
          v-model="showMenu"
          :close-on-content-click="false">
          <template v-slot:activator="{ on, attrs }">
            <FcButton
              type="secondary"
              v-bind="attrs"
              :disabled="disabled"
              v-on="on">
              <v-icon v-if="hasCurrentStatus" :color="currentStatus.color" left>
                mdi-circle-medium
              </v-icon>
              <span>Set Status</span>
              <v-icon right>mdi-menu-down</v-icon>
            </FcButton>
          </template>
          <v-list>
            <v-list-item v-for="status in statusTransitions" :key="status.name"
              class="fc-item-study-requests-status"
              @click="transitionStatus(status)">
              <v-list-item-title v-if="statusTriggersEmails(status)" class="with-subtext">
                <v-icon :color="status.color" left>mdi-circle-medium</v-icon>
                <div class="text">
                  <div>
                    {{ status.text }}
                  </div>
                  <div class="sub">Subscribers will be notified</div>
                </div>
              </v-list-item-title>
              <v-list-item-title v-else>
                <v-icon :color="status.color" left>mdi-circle-medium</v-icon>
                <span>{{ status.text }}</span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <CancelStudyRequestConfirmDialog
          :showDialog="showDialog"
          :nRequests="nRequests"
          @cancelConfirmed="cancel"
          @close="showDialog = false"
        />
      </div>
    </template>
    <span class="no-cancel">
      Please select requests with the same status in order to update their statuses.
    </span>
  </v-tooltip>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import CancelStudyRequestConfirmDialog from '@/web/components/dialogs/CancelStudyRequestConfirmDialog.vue';
import { StudyRequestStatus } from '@/lib/Constants';

export default {
  name: 'SetStatusDropdown',
  components: {
    FcButton,
    CancelStudyRequestConfirmDialog,
  },
  props: {
    currentStatus: {
      type: Object,
      default: null,
    },
    statusTransitions: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    nRequests: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      showMenu: false,
      showDialog: false,
      isHovering: false,
    };
  },
  computed: {
    showTooltip() {
      return this.isHovering && this.isForMultipleRequests && this.disabled;
    },
    isForMultipleRequests() {
      return this.nRequests > 1;
    },
    hasCurrentStatus() {
      return this.currentStatus !== null;
    },
  },
  methods: {
    cancel() {
      this.$emit('transition-status', StudyRequestStatus.CANCELLED);
    },
    transitionStatus(nextStatus) {
      this.showMenu = false;
      if (nextStatus === StudyRequestStatus.CANCELLED) {
        this.showDialog = true;
      } else {
        this.$emit('transition-status', nextStatus);
      }
      return false;
    },
    statusTriggersEmails(status) {
      const srs = StudyRequestStatus;
      return status === srs.COMPLETED || status === srs.CANCELLED;
    },
  },
};
</script>

<style lang="scss">
.v-tooltip__content {
  max-width: 350px !important;
}

.v-list-item__title .v-icon {
  bottom: 1px;
}

.v-list-item__title.with-subtext {

  .v-icon {
    vertical-align: text-bottom;
    bottom: 3px;
  }

  .text {
    display: inline-block;

    .sub {
      font-weight: 400;
      font-size: 12px;
      color: #757575;
    }
  }
}

</style>
