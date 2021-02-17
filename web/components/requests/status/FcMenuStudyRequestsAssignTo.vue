<template>
  <v-menu>
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        :class="buttonClass"
        :disabled="disabled || !canAssignTo"
        :small="small"
        type="secondary"
        :width="width"
        v-bind="{
          ...attrs,
          ...$attrs,
        }"
        v-on="on">
        <span>{{text}}</span>
        <span
          v-if="textScreenReader !== null"
          class="sr-only">
          : {{textScreenReader}}
        </span>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        @click="actionMenu(item)">
        <v-list-item-title>
          {{item.text}}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapMutations } from 'vuex';

import { StudyRequestAssignee, StudyRequestStatus } from '@/lib/Constants';
import RequestActions from '@/lib/requests/RequestActions';
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
    small: {
      type: Boolean,
      default: false,
    },
    studyRequests: Array,
    text: {
      type: String,
      default: 'Assign To',
    },
    textScreenReader: {
      type: String,
      default: null,
    },
    width: {
      type: [Number, String],
      default: undefined,
    },
  },
  computed: {
    assignedToStr() {
      return bulkAssignedToStr(this.studyRequests);
    },
    canAssignTo() {
      return this.studyRequests.some(
        studyRequest => RequestActions.canAssignTo(this.auth.user, studyRequest),
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
      const studyRequestsUnactionable = [];
      this.studyRequests.forEach((studyRequest) => {
        if (RequestActions.canAssignTo(this.auth.user, studyRequest)) {
          RequestActions.actionAssignTo(studyRequest, assignedTo);
        } else {
          studyRequestsUnactionable.push(studyRequest);
        }
      });
      this.displayFeedback(studyRequestsUnactionable, item);
    },
    actionMenu(item) {
      this.actionAssignTo(item);
      this.$emit('update');
    },
    displayFeedback(studyRequestsUnactionable, item) {
      if (studyRequestsUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyRequestsUnactionable',
          dialogData: {
            status: StudyRequestStatus.ASSIGNED,
            studyRequests: this.studyRequests,
            studyRequestsUnactionable,
          },
        });
      } else {
        const requestsPlural = this.studyRequests.length > 1 ? 'requests have' : 'request has';
        this.setToastInfo(`Your ${requestsPlural} been assigned to ${item.text}.`);
      }
    },
    /* eslint-enable no-param-reassign */
    ...mapMutations(['setDialog', 'setToastInfo']),
  },
};
</script>
