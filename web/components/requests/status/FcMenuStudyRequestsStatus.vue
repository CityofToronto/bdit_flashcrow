<template>
  <v-menu
    v-model="internalValue"
    :close-on-content-click="false"
    min-width="200">
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        :disabled="disabled"
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
          @click="actionMenu(item)">
          <v-list-item-title>
            <v-icon :color="item.value.color" left>mdi-circle-medium</v-icon>
            <span>{{item.text}}</span>
          </v-list-item-title>
        </v-list-item>
        <v-list-group
          v-else
          :key="i">
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
            @click="actionSubmenu(item, subitem)">
            <v-list-item-title>{{subitem.text}}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
  </v-menu>
</template>

<script>
import { StudyRequestAssignee, StudyRequestStatus } from '@/lib/Constants';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcMenuStudyRequestsStatus',
  components: {
    FcButton,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    status: StudyRequestStatus,
    studyRequests: Array,
  },
  data() {
    return {
      internalValue: false,
    };
  },
  computed: {
    items() {
      return [
        { text: 'Needs Changes', value: StudyRequestStatus.CHANGES_NEEDED },
        {
          items: [
            { text: 'None', value: null },
            ...StudyRequestAssignee.enumValues.map(
              enumValue => ({ text: enumValue.text, value: enumValue }),
            ),
          ],
          text: 'Assign To',
          value: StudyRequestStatus.ASSIGNED,
        },
        { text: 'Mark Completed', value: StudyRequestStatus.COMPLETED },
        { text: 'Reject Data', value: StudyRequestStatus.REJECTED },
        { text: 'Cancel Request', value: StudyRequestStatus.CANCELLED },
      ];
    },
  },
  methods: {
    actionMenu(item) {
      this.internalValue = false;
      this.$emit('action-menu', { item, subitem: null });
    },
    actionSubmenu(item, subitem) {
      this.internalValue = false;
      this.$emit('action-menu', { item, subitem });
    },
  },
};
</script>
