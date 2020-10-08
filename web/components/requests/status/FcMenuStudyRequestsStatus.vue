<template>
  <v-menu
    v-model="showMenu"
    :close-on-content-click="false"
    min-width="200"
    z-index="100">
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        :class="buttonClass"
        :disabled="disabled || !hasAvailableAction"
        type="secondary"
        v-bind="attrs"
        v-on="on">
        <v-icon
          v-if="status !== null"
          :color="status.color"
          left>
          mdi-circle-medium
        </v-icon>
        <span>Set Status</span>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list>
      <template v-for="(item, i) in items">
        <v-list-item
          v-if="item.items === undefined || item.items.length === 0"
          :key="i"
          class="fc-item-study-requests-status"
          :disabled="item.disabled"
          @click="actionMenu(item, null)">
          <v-list-item-title>
            <v-icon :color="item.value.color" left>mdi-circle-medium</v-icon>
            <span>{{item.text}}</span>
          </v-list-item-title>
        </v-list-item>
        <v-list-group
          v-else
          :key="i"
          v-model="showSubmenu"
          class="fc-submenu-study-requests-status"
          :disabled="item.disabled">
          <template v-slot:activator>
            <v-list-item-title>
              <v-icon :color="item.value.color" left>mdi-circle-medium</v-icon>
              <span>{{item.text}}</span>
            </v-list-item-title>
          </template>
          <v-list-item
            v-for="(subitem, j) in item.items"
            :key="i + '_' + j"
            link
            @click="actionMenu(item, subitem)">
            <v-list-item-title>{{subitem.text}}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
  </v-menu>
</template>

<script>
import { mapMutations } from 'vuex';

import { StudyRequestAssignee, StudyRequestStatus } from '@/lib/Constants';
import RequestActions from '@/lib/requests/RequestActions';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcMenuStudyRequestsStatus',
  mixins: [FcMixinAuthScope],
  components: {
    FcButton,
  },
  props: {
    buttonClass: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showAssignTo: {
      type: Boolean,
      default: true,
    },
    status: {
      type: StudyRequestStatus,
      default: null,
    },
    studyRequests: Array,
  },
  data() {
    return {
      showMenu: false,
      showSubmenu: false,
    };
  },
  computed: {
    canAssignTo() {
      return this.studyRequests.some(
        studyRequest => RequestActions.canAssignTo(this.auth.user, studyRequest),
      );
    },
    canCancel() {
      return this.studyRequests.some(
        studyRequest => RequestActions.canCancel(this.auth.user, studyRequest),
      );
    },
    canMarkCompleted() {
      return this.studyRequests.some(
        studyRequest => RequestActions.canMarkCompleted(this.auth.user, studyRequest),
      );
    },
    canRejectData() {
      return this.studyRequests.some(
        studyRequest => RequestActions.canRejectData(this.auth.user, studyRequest),
      );
    },
    canReopen() {
      return this.studyRequests.some(
        studyRequest => RequestActions.canReopen(this.auth.user, studyRequest),
      );
    },
    canRequestChanges() {
      return this.studyRequests.some(
        studyRequest => RequestActions.canRequestChanges(this.auth.user, studyRequest),
      );
    },
    hasAvailableAction() {
      return this.items.some(({ disabled }) => !disabled);
    },
    items() {
      const items = [{
        disabled: !this.canRequestChanges,
        text: 'Request Changes',
        value: StudyRequestStatus.CHANGES_NEEDED,
      }];
      if (this.showAssignTo) {
        items.push({
          disabled: !this.canAssignTo,
          items: [
            { text: 'Unassigned', value: null },
            ...StudyRequestAssignee.enumValues.map(
              enumValue => ({ text: enumValue.text, value: enumValue }),
            ),
          ],
          text: 'Assign To',
          value: StudyRequestStatus.ASSIGNED,
        });
      }
      items.push({
        disabled: !this.canMarkCompleted,
        text: 'Mark Completed',
        value: StudyRequestStatus.COMPLETED,
      }, {
        disabled: !this.canRejectData,
        text: 'Reject Data',
        value: StudyRequestStatus.REJECTED,
      }, {
        disabled: !this.canCancel,
        text: 'Cancel',
        value: StudyRequestStatus.CANCELLED,
      }, {
        disabled: !this.canReopen,
        text: 'Reopen',
        value: StudyRequestStatus.REQUESTED,
      });
      return items;
    },
  },
  watch: {
    showMenu() {
      if (!this.showMenu) {
        this.showSubmenu = false;
      }
    },
  },
  methods: {
    /* eslint-disable no-param-reassign */
    actionAssignTo(subitem) {
      const assignedTo = subitem.value;
      const studyRequestsUnactionable = [];
      this.studyRequests.forEach((studyRequest) => {
        if (RequestActions.canAssignTo(this.auth.user, studyRequest)) {
          RequestActions.actionAssignTo(studyRequest, assignedTo);
        } else {
          studyRequestsUnactionable.push(studyRequest);
        }
      });
      if (studyRequestsUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyRequestsUnactionable',
          dialogData: {
            actionVerb: 'assign',
            actionVerbPastTense: 'assigned',
            studyRequests: this.studyRequests,
            studyRequestsUnactionable,
          },
        });
      }
    },
    actionCancel() {
      const studyRequestsUnactionable = [];
      this.studyRequests.forEach((studyRequest) => {
        if (RequestActions.canCancel(this.auth.user, studyRequest)) {
          RequestActions.actionCancel(studyRequest);
        } else {
          studyRequestsUnactionable.push(studyRequest);
        }
      });
      if (studyRequestsUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyRequestsUnactionable',
          dialogData: {
            actionVerb: 'cancel',
            actionVerbPastTense: 'cancelled',
            studyRequests: this.studyRequests,
            studyRequestsUnactionable,
          },
        });
      }
    },
    actionMarkCompleted() {
      const studyRequestsUnactionable = [];
      this.studyRequests.forEach((studyRequest) => {
        if (RequestActions.canMarkCompleted(this.auth.user, studyRequest)) {
          RequestActions.actionMarkCompleted(studyRequest);
        } else {
          studyRequestsUnactionable.push(studyRequest);
        }
      });
      if (studyRequestsUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyRequestsUnactionable',
          dialogData: {
            actionVerb: 'complete',
            actionVerbPastTense: 'completed',
            studyRequests: this.studyRequests,
            studyRequestsUnactionable,
          },
        });
      }
    },
    actionMenu(item, subitem) {
      this.showMenu = false;

      if (item.value === StudyRequestStatus.CHANGES_NEEDED) {
        this.actionRequestChanges();
      } else if (item.value === StudyRequestStatus.ASSIGNED) {
        this.actionAssignTo(subitem);
      } else if (item.value === StudyRequestStatus.COMPLETED) {
        this.actionMarkCompleted();
      } else if (item.value === StudyRequestStatus.REJECTED) {
        this.actionRejectData();
      } else if (item.value === StudyRequestStatus.CANCELLED) {
        this.actionCancel();
      } else if (item.value === StudyRequestStatus.REQUESTED) {
        this.actionReopen();
      }

      this.$emit('update');
    },
    actionRejectData() {
      const studyRequestsUnactionable = [];
      this.studyRequests.forEach((studyRequest) => {
        if (RequestActions.canRejectData(this.auth.user, studyRequest)) {
          RequestActions.actionRejectData(studyRequest);
        } else {
          studyRequestsUnactionable.push(studyRequest);
        }
      });
      if (studyRequestsUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyRequestsUnactionable',
          dialogData: {
            actionVerb: 'reject',
            actionVerbPastTense: 'rejected',
            studyRequests: this.studyRequests,
            studyRequestsUnactionable,
          },
        });
      }
    },
    actionReopen() {
      const studyRequestsUnactionable = [];
      this.studyRequests.forEach((studyRequest) => {
        if (RequestActions.canReopen(this.auth.user, studyRequest)) {
          RequestActions.actionReopen(studyRequest);
        } else {
          studyRequestsUnactionable.push(studyRequest);
        }
      });
      if (studyRequestsUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyRequestsUnactionable',
          dialogData: {
            actionVerb: 'reopen',
            actionVerbPastTense: 'reopened',
            studyRequests: this.studyRequests,
            studyRequestsUnactionable,
          },
        });
      }
    },
    actionRequestChanges() {
      const studyRequestsUnactionable = [];
      this.studyRequests.forEach((studyRequest) => {
        if (RequestActions.canRequestChanges(this.auth.user, studyRequest)) {
          RequestActions.actionRequestChanges(studyRequest);
        } else {
          studyRequestsUnactionable.push(studyRequest);
        }
      });
      if (studyRequestsUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyRequestsUnactionable',
          dialogData: {
            actionVerb: 'request changes for',
            actionVerbPastTense: 'returned to submitter for changes',
            studyRequests: this.studyRequests,
            studyRequestsUnactionable,
          },
        });
      }
    },
    /* eslint-enable no-param-reassign */
    ...mapMutations(['setDialog']),
  },
};
</script>

<style lang="scss">
.fc-submenu-study-requests-status.v-list-group--disabled {
  opacity: 0.38;
  & > div:hover::before {
    background-color: transparent;
  }
}

.fc-item-study-requests-status.v-list-item--disabled .v-icon {
  opacity: 0.38;
}
</style>