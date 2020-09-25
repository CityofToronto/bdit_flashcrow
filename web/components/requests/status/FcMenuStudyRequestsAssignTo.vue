<template>
  <v-menu>
    <template v-slot:activator="{ on }">
      <FcButton
        :class="buttonClass"
        :disabled="disabled"
        type="secondary"
        v-on="on">
        <span>Assign To</span>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) in items"
        :disabled="item.disabled"
        :key="i"
        @click="actionAssignTo(item)">
        <v-list-item-title>
          {{text}}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { AuthScope, StudyRequestAssignee, StudyRequestStatus } from '@/lib/Constants';
import { bulkAssignedToStr } from '@/lib/requests/RequestStudyBulkUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcMenuStudyRequestsAssignTo',
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
    studyRequests: Array,
  },
  computed: {
    assignedToStr() {
      return bulkAssignedToStr(this.studyRequests);
    },
    canAssignTo() {
      if (!this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return false;
      }
      return this.studyRequests.some(
        ({ status }) => status.canTransitionTo(StudyRequestStatus.ASSIGNED)
          || status === StudyRequestStatus.ASSIGNED,
      );
    },
    items() {
      return [
        { text: 'Unassigned', value: null },
        ...StudyRequestAssignee.enumValues.map(
          enumValue => ({ text: enumValue.text, value: enumValue }),
        ),
      ];
    },
  },
  methods: {
    /* eslint-disable no-param-reassign */
    actionAssignTo(item) {
      const assignedTo = item.value;

      this.studyRequests.forEach((studyRequest) => {
        studyRequest.assignedTo = assignedTo;
        if (assignedTo === null) {
          studyRequest.status = StudyRequestStatus.REQUESTED;
        } else {
          studyRequest.status = StudyRequestStatus.ASSIGNED;
        }
      });
    },
    actionMenu(item) {
      this.actionAssignTo(item);
      this.$emit('update');
    },
    /* eslint-enable no-param-reassign */
  },
};
</script>
