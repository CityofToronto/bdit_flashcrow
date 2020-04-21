<template>
  <FcDataTable
    v-model="internalValue"
    class="fc-data-table-requests"
    :columns="columns"
    fixed-header
    height="100%"
    :items="items"
    :loading="loading"
    must-sort
    show-select
    sort-by="ID"
    :sort-desc="true"
    :sort-keys="sortKeys">
    <template v-slot:no-data>
      <div class="mt-8 pt-7 secondary--text">
        <span v-if="itemsStudyRequests.length === 0">
          You have not requested a study,<br>
          please view the map <router-link :to="{name: 'viewData'}">here</router-link>
        </span>
        <span v-else>
          No requests match the active filters,<br>
          clear one or more filters to see requests
        </span>
      </div>
    </template>
    <template v-slot:header.data-table-select>
    </template>
    <template v-slot:item.ID="{ item }">
      <span>{{item.studyRequest.id}}</span>
    </template>
    <template v-slot:item.LOCATION="{ item }">
      <div class="text-truncate">
        <span
          v-if="item.location !== null"
          :title="item.location.description">
          {{item.location.description}}
        </span>
      </div>
    </template>
    <template v-slot:item.STUDY_TYPE="{ item }">
      <div class="text-truncate">
        {{item.studyRequest.studyType.label}}
      </div>
    </template>
    <template v-slot:item.REQUESTER="{ item }">
      <div class="text-truncate">
        <span
          v-if="item.requestedBy !== null"
          :title="item.requestedBy.uniqueName">
          {{item.requestedBy.uniqueName}}
        </span>
      </div>
    </template>
    <template v-slot:item.CREATED_AT="{ item }">
      <span>{{item.studyRequest.createdAt | date}}</span>
    </template>
    <template v-slot:item.ASSIGNED_TO="{ item }">
      <v-menu
        v-if="hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)
          && (
            item.studyRequest.status.canTransitionTo(StudyRequestStatus.ASSIGNED)
            || item.studyRequest.status === StudyRequestStatus.ASSIGNED
          )">
        <template v-slot:activator="{ on }">
          <FcButton
            :loading="loadingItems.has(item.id)"
            type="secondary"
            width="140"
            v-on="on">
            <span v-if="item.studyRequest.assignedTo === null">
              None
            </span>
            <span v-else>{{item.studyRequest.assignedTo.text}}</span>
            <v-spacer></v-spacer>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item
            v-for="({ text, value }, i) in itemsAssignedTo"
            :key="i"
            @click="$emit('assign-to', { item, assignedTo: value })">
            <v-list-item-title>
              {{text}}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <span v-else-if="item.studyRequest.assignedTo === null">
        None
      </span>
      <span v-else>{{item.studyRequest.assignedTo.text}}</span>
    </template>
    <template v-slot:item.DUE_DATE="{ item }">
      <span>{{item.studyRequest.dueDate | date}}</span>
    </template>
    <template v-slot:item.STATUS="{ item }">
      <div class="align-center d-flex">
        <v-icon :color="item.studyRequest.status.color">mdi-circle-medium</v-icon>
        <span>{{item.studyRequest.status.text}}</span>
      </div>
    </template>
    <template v-slot:item.LAST_EDITED_AT="{ item }">
      <span v-if="item.studyRequest.lastEditedAt === null">
        {{item.studyRequest.createdAt | date}}
      </span>
      <span v-else>
        {{item.studyRequest.lastEditedAt | date}}
      </span>
    </template>
    <template v-slot:header.ACTIONS>
      <span class="sr-only">Actions</span>
    </template>
    <template v-slot:item.ACTIONS="{ item }">
      <div class="text-right">
        <v-icon
          v-if="item.studyRequest.urgent"
          class="mr-2"
          color="warning"
          title="Urgent">mdi-clipboard-alert</v-icon>

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <FcButton
              :aria-label="'View Request #' + item.studyRequest.id"
              type="icon"
              @click="$emit('show-request', item)"
              v-on="on">
              <v-icon>mdi-file-eye</v-icon>
            </FcButton>
          </template>
          <span>View Request #{{item.studyRequest.id}}</span>
        </v-tooltip>
      </div>
    </template>
  </FcDataTable>
</template>

<script>
import {
  SortKeys,
  StudyRequestAssignee,
  StudyRequestStatus,
} from '@/lib/Constants';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDataTableRequests',
  mixins: [
    FcMixinAuthScope,
    FcMixinVModelProxy(Array),
  ],
  components: {
    FcButton,
    FcDataTable,
  },
  props: {
    columns: Array,
    items: Array,
    loading: {
      type: Boolean,
      default: false,
    },
    loadingItems: Set,
  },
  data() {
    const itemsAssignedTo = [
      { text: 'None', value: null },
      ...StudyRequestAssignee.enumValues.map(
        enumValue => ({ text: enumValue.text, value: enumValue }),
      ),
    ];

    return {
      itemsAssignedTo,
      sortKeys: SortKeys.Requests,
      StudyRequestStatus,
    };
  },
};
</script>
