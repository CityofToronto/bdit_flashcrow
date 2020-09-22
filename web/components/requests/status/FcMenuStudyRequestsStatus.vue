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
        <v-icon :color="status.color" left>mdi-circle-medium</v-icon>
        <span>Status</span>
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
import { AuthScope, StudyRequestAssignee, StudyRequestStatus } from '@/lib/Constants';
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
    status: StudyRequestStatus,
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
      if (!this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return false;
      }
      return this.studyRequests.every(
        ({ status }) => status.canTransitionTo(StudyRequestStatus.ASSIGNED),
      );
    },
    canCancel() {
      return this.studyRequests.every(
        ({ status }) => status.canTransitionTo(StudyRequestStatus.CANCELLED),
      );
    },
    canMarkCompleted() {
      return this.studyRequests.every(
        ({ status }) => status.canTransitionTo(StudyRequestStatus.COMPLETED),
      );
    },
    canRejectData() {
      return this.studyRequests.every(
        ({ status }) => status.canTransitionTo(StudyRequestStatus.REJECTED),
      );
    },
    canReopen() {
      return this.studyRequests.every(
        ({ closed, status }) => closed && status.canTransitionTo(StudyRequestStatus.REQUESTED),
      );
    },
    canRequestChanges() {
      if (!this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return false;
      }
      return this.studyRequests.every(
        ({ status }) => status.canTransitionTo(StudyRequestStatus.CHANGES_NEEDED),
      );
    },
    hasAvailableAction() {
      return this.items.some(({ disabled }) => !disabled);
    },
    items() {
      return [
        {
          disabled: !this.canRequestChanges,
          text: 'Request Changes',
          value: StudyRequestStatus.CHANGES_NEEDED,
        },
        {
          disabled: !this.canAssignTo,
          items: [
            { text: 'None', value: null },
            ...StudyRequestAssignee.enumValues.map(
              enumValue => ({ text: enumValue.text, value: enumValue }),
            ),
          ],
          text: 'Assign To',
          value: StudyRequestStatus.ASSIGNED,
        },
        {
          disabled: !this.canMarkCompleted,
          text: 'Mark Completed',
          value: StudyRequestStatus.COMPLETED,
        },
        {
          disabled: !this.canRejectData,
          text: 'Reject Data',
          value: StudyRequestStatus.REJECTED,
        },
        {
          disabled: !this.canCancel,
          text: 'Cancel',
          value: StudyRequestStatus.CANCELLED,
        },
        {
          disabled: !this.canReopen,
          text: 'Reopen',
          value: StudyRequestStatus.REQUESTED,
        },
      ];
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

      this.studyRequests.forEach((studyRequest) => {
        studyRequest.assignedTo = assignedTo;
        if (assignedTo === null) {
          studyRequest.status = StudyRequestStatus.REQUESTED;
        } else {
          studyRequest.status = StudyRequestStatus.ASSIGNED;
        }
      });
    },
    actionCancel() {
      this.studyRequests.forEach((studyRequest) => {
        studyRequest.status = StudyRequestStatus.CANCELLED;
        studyRequest.closed = true;
      });
    },
    actionMarkCompleted() {
      this.studyRequests.forEach((studyRequest) => {
        studyRequest.status = StudyRequestStatus.COMPLETED;
        studyRequest.closed = true;
      });
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
      this.studyRequests.forEach((studyRequest) => {
        studyRequest.status = StudyRequestStatus.REJECTED;
        studyRequest.closed = true;
      });
    },
    actionReopen() {
      this.studyRequests.forEach((studyRequest) => {
        studyRequest.status = StudyRequestStatus.REQUESTED;
        studyRequest.closed = false;
      });
    },
    actionRequestChanges() {
      this.studyRequests.forEach((studyRequest) => {
        studyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
      });
    },
    /* eslint-enable no-param-reassign */
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
