<template>
  <v-menu
    v-model="showMenu"
    v-if="userIsStudyRequestAdmin && areValidTransitions"
    :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        type="secondary"
        v-bind="attrs"
        v-on="on">
        <v-icon :color="currentStatus.color" left>
          mdi-circle-medium
        </v-icon>
        <span>Set Status</span>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list>
      <v-list-item v-for="status in validStatusTransitions" :key="status.name"
        class="fc-item-study-requests-status"
        @click="transitionStatus(status)">
      <v-list-item-title>
        <v-icon :color="status.color" left>mdi-circle-medium</v-icon>
        <span>{{ status.text }}</span>
      </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
  <FcButton
    v-else-if="userIsStudyRequester"
    class="ml-2"
    type="secondary"
    :disabled="!userCanCancelStudyRequest"
    @click="transitionStatus(cancelledStatus)">
    CANCEL
  </FcButton>
</template>

<script>
import { mapMutations } from 'vuex';
import SrStatusTransitionValidator from '@/lib/SrStatusTransitionValidator';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import { StudyRequestStatus } from '@/lib/Constants';

export default {
  name: 'SetStatusControl',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    FcButton,
  },
  props: {
    studyRequest: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showMenu: false,
    };
  },
  computed: {
    currentStatus() {
      return this.studyRequest.status;
    },
    userIsStudyRequestAdmin() {
      return this.hasAuthScope(this.AuthScope.STUDY_REQUESTS_ADMIN);
    },
    userIsStudyRequester() {
      return this.auth.user.id === this.studyRequest.userId;
    },
    transitionValidator() {
      return new SrStatusTransitionValidator(this.auth.user.scope);
    },
    validStatusTransitions() {
      return this.transitionValidator.getRulesForScope(this.currentStatus);
    },
    areValidTransitions() {
      return this.validStatusTransitions.length > 0;
    },
    cancelledStatus() {
      return StudyRequestStatus.CANCELLED;
    },
    userCanCancelStudyRequest() {
      return this.transitionValidator.isValidTransition(
        this.studyRequest.status, this.cancelledStatus,
      );
    },
  },
  methods: {
    transitionStatus(nextStatus) {
      this.showMenu = false;
      this.studyRequest.status = nextStatus;
      this.$emit('update');
      this.setToastInfo(`Request #${this.studyRequest.id} set to "${nextStatus.text}"`);
    },
    ...mapMutations(['setToastInfo']),
  },
};
</script>
