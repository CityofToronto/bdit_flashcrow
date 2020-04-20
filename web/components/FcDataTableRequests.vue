<template>
  <FcDataTable
    v-model="internalValue"
    class="fc-data-table-requests"
    :columns="columns"
    fixed-header
    height="100%"
    :items="requests"
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
      <span>{{item.id}}</span>
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
        {{item.studyType.label}}
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
      <span>{{item.createdAt | date}}</span>
    </template>
    <template v-slot:item.ASSIGNED_TO="{ item }">
      <span v-if="item.assignedTo === null">
        NONE
      </span>
      <span v-else>{{item.assignedTo.replace('_', ' ')}}</span>
    </template>
    <template v-slot:item.DUE_DATE="{ item }">
      <span>{{item.dueDate | date}}</span>
    </template>
    <template v-slot:item.STATUS="{ item }">
      <div class="align-center d-flex">
        <v-icon :color="item.status.color">mdi-circle-medium</v-icon>
        <span>{{item.status.text}}</span>
      </div>
    </template>
    <template v-slot:item.LAST_EDITED_AT="{ item }">
      <span v-if="item.lastEditedAt === null">
        {{item.createdAt | date}}
      </span>
      <span v-else>
        {{item.lastEditedAt | date}}
      </span>
    </template>
    <template v-slot:header.ACTIONS>
      <span class="sr-only">Actions</span>
    </template>
    <template v-slot:item.ACTIONS="{ item }">
      <div class="text-right">
        <v-icon
          v-if="item.urgent"
          class="mr-2"
          color="warning"
          title="Urgent">mdi-clipboard-alert</v-icon>

        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <FcButton
              :aria-label="'View Request #' + item.id"
              type="icon"
              @click="$emit('show-request', item)"
              v-on="on">
              <v-icon>mdi-file-eye</v-icon>
            </FcButton>
          </template>
          <span>View Request #{{item.id}}</span>
        </v-tooltip>
      </div>
    </template>
  </FcDataTable>
</template>

<script>
import { SortKeys } from '@/lib/Constants';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDataTableRequests',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButton,
    FcDataTable,
  },
  props: {
    columns: Array,
    loading: {
      type: Boolean,
      default: false,
    },
    requests: Array,
  },
  data() {
    return {
      sortKeys: SortKeys.Requests,
    };
  },
};
</script>
