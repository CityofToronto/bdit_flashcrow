<template>
  <div>
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
        <v-list-item-title>
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
      required: false,
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
    };
  },
  computed: {
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
  },
};
</script>
