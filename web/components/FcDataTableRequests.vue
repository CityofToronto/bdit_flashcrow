<template>
  <FcDataTable
    :aria-labelledby="ariaLabelledby"
    class="fc-data-table-requests"
    :class="{
      'is-expanded-child': isExpandedChild,
    }"
    :columns="columns"
    fixed-header
    height="100%"
    :hide-default-header="isExpandedChild"
    :items="items"
    :loading="loading"
    must-sort
    show-expand
    single-expand
    :sort-by.sync="internalSortBy"
    :sort-desc.sync="internalSortDesc"
    :sort-keys="sortKeys">
    <template v-slot:no-data>
      <div class="mt-8 pt-7 secondary--text">
        <span v-if="hasFilters">
          No requests match the active filters,<br>
          clear one or more filters to see requests
        </span>
        <span v-else>
          No studies have been requested,<br>
          please <router-link :to="{name: 'viewData'}">view the map</router-link>
        </span>
      </div>
    </template>
    <template v-slot:header.SELECT>
      <span class="sr-only">Select</span>
    </template>
    <template v-slot:item.SELECT="{ item }">
      <FcTooltip right>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-checkbox
              v-if="item.type === ItemType.STUDY_REQUEST"
              v-model="internalValue"
              :aria-label="'Select ' + item.ariaLabel"
              class="mt-0 pt-0"
              hide-details
              :value="item" />
            <v-checkbox
              v-else
              :aria-label="'Select ' + item.ariaLabel"
              class="mt-0 pt-0"
              hide-details
              :indeterminate="selectAll[item.id] === null"
              :input-value="selectAll[item.id]"
              @click="actionSelectAll(item)" />
          </div>
        </template>
        <span>Select {{item.ariaLabel}}</span>
      </FcTooltip>

    </template>
    <template v-slot:item.ID="{ item }">
      <span
        v-if="item.type.name === 'STUDY_REQUEST'"
        class="text-truncate"
        :title="item.studyRequest.id">
        {{item.studyRequest.id}}
      </span>
    </template>
    <template v-slot:item.LOCATION="{ item }">
      <div
        v-if="item.type.name === 'STUDY_REQUEST_BULK'"
        class="align-center d-flex">
        <v-icon left>mdi-map-marker-multiple</v-icon>
        <div class="text-wrap">{{item.studyRequestBulk.name}}</div>
      </div>
      <div
        v-else-if="item.location !== null"
        class="text-wrap">
        {{item.location.description}}
      </div>
    </template>
    <template v-slot:header.data-table-expand>
      <span class="sr-only">Expand</span>
    </template>
    <template v-slot:item.data-table-expand="{ expand, isExpanded, item }">
      <FcButtonAria
        v-if="item.type.name === 'STUDY_REQUEST_BULK'"
        :aria-label="
          (isExpanded ? 'Collapse ' : 'Expand ') + item.ariaLabel
        "
        right
        type="icon"
        @click="expand(!isExpanded)">
        <v-icon v-if="isExpanded">mdi-menu-up</v-icon>
        <v-icon v-else>mdi-menu-down</v-icon>
      </FcButtonAria>
    </template>
    <template v-slot:item.STUDY_TYPE="{ item }">
      <div class="text-wrap">
        <span v-if="item.type.name === 'STUDY_REQUEST_BULK'">
          Multiple Locations
          <FcTextNumberTotal
            class="ml-1"
            :k="hasFilters ? item.studyRequestBulk.studyRequests.length : null"
            :n="hasFilters
              ? item.studyRequestsTotal
              : item.studyRequestBulk.studyRequests.length" />
        </span>
        <FcTooltip
          v-else-if="item.studyRequest.studyType.other"
          left>
          <template v-slot:activator="{ on }">
            <span v-on="on">
              {{item.studyRequest.studyType.label}}
              <span class="sr-only">({{item.studyRequest.studyTypeOther}})</span>
            </span>
          </template>
          <span>{{item.studyRequest.studyTypeOther}}</span>
        </FcTooltip>
        <span v-else>
          {{item.studyRequest.studyType.label}}
        </span>
      </div>
    </template>
    <template v-slot:item.REQUESTER="{ item }">
      <div class="text-truncate">
        <span
          v-if="!isExpandedChild && item.requestedBy !== null"
          :title="item.requestedBy">
          {{item.requestedBy | username}}
        </span>
      </div>
    </template>
    <template v-slot:item.CREATED_AT="{ item }">
      <span v-if="!isExpandedChild">
        {{item.createdAt | date}}
      </span>
    </template>
    <template v-slot:item.ASSIGNED_TO="{ item }">
      <FcMenuStudyRequestsAssignTo
        v-if="canAssignTo(item)"
        button-class="body-1"
        small
        :study-requests="[item.studyRequest]"
        :text="item.assignedTo"
        width="140"
        @update="actionUpdateItem(item)" />
      <span v-else>{{item.assignedTo}}</span>
    </template>
    <template v-slot:item.DUE_DATE="{ item }">
      <span
        v-if="parentItem === null || !item.dueDate.equals(parentItem.dueDate)">
        {{item.dueDate | date}}
      </span>
    </template>
    <template v-slot:item.STATUS="{ item }">
      <div class="align-center d-flex">
        <v-icon :color="item.status.color" class="ml-n2">mdi-circle-medium</v-icon>
        <span>{{item.status.text}}</span>
      </div>
    </template>
    <template v-slot:item.LAST_EDITED_AT="{ item }">
      <span v-if="item.lastEditedAt !== null">
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
          :aria-hidden="false"
          aria-label="Urgent"
          class="mr-2"
          color="warning">mdi-clipboard-alert</v-icon>

        <FcButtonAria
          :aria-label="'View ' + item.ariaLabel"
          button-class="btn-show-request"
          left
          type="secondary"
          @click="actionShowItem(item)">
          <v-icon>mdi-open-in-new</v-icon>
        </FcButtonAria>
      </div>
    </template>
    <template v-slot:expanded-item="{ headers, item }">
      <template v-if="item.type.name === 'STUDY_REQUEST_BULK'">
        <td
          class="px-0"
          :colspan="headers.length">
          <FcDataTableRequests
            v-model="internalValue"
            :columns="columns"
            :has-filters="hasFilters"
            :items="item.studyRequestBulk.studyRequests"
            :loading="loading"
            :parent-item="item"
            @update-item="actionUpdateItem" />
        </td>
      </template>
    </template>
  </FcDataTable>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import {
  StudyRequestAssignee,
  StudyRequestStatus,
} from '@/lib/Constants';
import { formatUsername } from '@/lib/StringFormatters';
import RequestActions from '@/lib/requests/RequestActions';
import { ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcMenuStudyRequestsAssignTo
  from '@/web/components/requests/status/FcMenuStudyRequestsAssignTo.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

function getSelectAll(internalValue, item) {
  let k = 0;
  item.studyRequestBulk.studyRequests.forEach((subitem) => {
    if (internalValue.includes(subitem)) {
      k += 1;
    }
  });
  if (k === 0) {
    return false;
  }
  if (k === item.studyRequestBulk.studyRequests.length) {
    return true;
  }
  return null;
}

export default {
  name: 'FcDataTableRequests',
  mixins: [
    FcMixinAuthScope,
    FcMixinVModelProxy(Array),
  ],
  components: {
    FcButtonAria,
    FcDataTable,
    FcMenuStudyRequestsAssignTo,
    FcTextNumberTotal,
    FcTooltip,
  },
  props: {
    ariaLabelledby: {
      type: String,
      default: null,
    },
    columns: Array,
    hasFilters: Boolean,
    items: Array,
    loading: {
      type: Boolean,
      default: false,
    },
    parentItem: {
      type: Object,
      default: null,
    },
  },
  data() {
    const itemsAssignedTo = [
      { text: 'Unassigned', value: null },
      ...StudyRequestAssignee.enumValues.map(
        enumValue => ({ text: enumValue.text, value: enumValue }),
      ),
    ];

    const sortKeys = {
      ASSIGNED_TO: (r) => {
        const dueDate = r.dueDate.toString();
        if (r.assignedTo !== 'Unassigned') {
          return `${r.assignedTo}:${dueDate}`;
        }
        return `ZZZ:${dueDate}`;
      },
      CREATED_AT: r => r.createdAt.toString(),
      DUE_DATE: r => r.dueDate.toString(),
      ID: (r) => {
        if (r.type.name === 'STUDY_REQUEST') {
          return r.studyRequest.id;
        }
        return Math.max(
          ...r.studyRequestBulk.studyRequests.map(
            ({ studyRequest }) => studyRequest.id,
          ),
        );
      },
      LAST_EDITED_AT: (r) => {
        if (r.lastEditedAt === null) {
          return `A:${r.dueDate.toString()}`;
        }
        return `B:${r.lastEditedAt.toString()}`;
      },
      LOCATION: (r) => {
        const dueDate = r.dueDate.toString();
        if (r.type.name === 'STUDY_REQUEST') {
          if (r.location === null) {
            return `ZZZ:${dueDate}`;
          }
          return `${r.location.description}:${dueDate}`;
        }
        return `${r.studyRequestBulk.name}:${dueDate}`;
      },
      REQUESTER: (r) => {
        const requestedBy = formatUsername(r.requestedBy);
        return `${requestedBy}:${r.dueDate.toString()}`;
      },
      STATUS: r => `${r.status.ordinal}:${r.dueDate.toString()}`,
      STUDY_TYPE: (r) => {
        const dueDate = r.dueDate.toString();
        if (r.type.name === 'STUDY_REQUEST') {
          return `${r.studyRequest.studyType.label}:${dueDate}`;
        }
        return `ZZZ:${dueDate}`;
      },
    };

    return {
      itemsAssignedTo,
      ItemType,
      sortKeys,
      StudyRequestStatus,
    };
  },
  computed: {
    internalSortBy: {
      get() {
        return this.sortRequest.sortBy;
      },
      set(internalSortBy) {
        this.setSortRequestSortBy(internalSortBy);
      },
    },
    internalSortDesc: {
      get() {
        return this.sortRequest.sortDesc;
      },
      set(internalSortDesc) {
        this.setSortRequestSortDesc(internalSortDesc);
      },
    },
    isExpandedChild() {
      return this.parentItem !== null;
    },
    selectAll() {
      const selectAll = {};
      this.items.forEach((item) => {
        if (item.type === ItemType.STUDY_REQUEST) {
          return;
        }
        selectAll[item.id] = getSelectAll(this.internalValue, item);
      });
      return selectAll;
    },
    ...mapState('trackRequests', ['sortRequest']),
  },
  methods: {
    actionSelectAll(item) {
      const selectAll = getSelectAll(this.internalValue, item);
      if (selectAll === true) {
        // deselect all in bulk study request
        item.studyRequestBulk.studyRequests.forEach((subitem) => {
          const i = this.internalValue.indexOf(subitem);
          if (i !== -1) {
            this.internalValue.splice(i, 1);
          }
        });
      } else {
        // select all in bulk study request
        item.studyRequestBulk.studyRequests.forEach((subitem) => {
          const i = this.internalValue.indexOf(subitem);
          if (i === -1) {
            this.internalValue.push(subitem);
          }
        });
      }
    },
    actionShowItem(item) {
      let route;
      if (item.type === ItemType.STUDY_REQUEST_BULK) {
        const { id } = item.studyRequestBulk;
        route = {
          name: 'requestStudyBulkView',
          params: { id },
        };
      } else {
        const { id } = item.studyRequest;
        route = {
          name: 'requestStudyView',
          params: { id },
        };
      }
      this.$router.push(route);
    },
    actionUpdateItem(item) {
      this.$emit('update-item', item);
    },
    canAssignTo(item) {
      if (item.type === ItemType.STUDY_REQUEST_BULK) {
        return false;
      }
      return RequestActions.canAssignTo(this.auth.user, item.studyRequest);
    },
    ...mapMutations('trackRequests', ['setSortRequestSortBy', 'setSortRequestSortDesc']),
  },
};
</script>

<style lang="scss">
.fc-data-table-requests {
  & td:nth-child(1) {
    min-width: 56px;
    width: 56px;
  }
  & td:nth-child(2),
  & th.fc-data-table-header-ID {
    min-width: 70px;
    width: 70px;
  }
  & td:nth-child(3),
  & th.fc-data-table-header-LOCATION {
    min-width: 210px;
    width: auto;
  }
  & td:nth-child(4),
  & th.fc-data-table-header-data-table-expand {
    min-width: 70px !important;
    width: 70px !important;
  }
  & td:nth-child(5),
  & th.fc-data-table-header-STUDY_TYPE {
    min-width: 210px;
    width: 210px;
  }
  & td:nth-child(6),
  & th.fc-data-table-header-REQUESTER {
    min-width: 140px;
    width: 140px;
  }
  & td:nth-child(7),
  & th.fc-data-table-header-CREATED_AT {
    min-width: 140px;
    width: 140px;
  }
  & td:nth-child(8),
  & th.fc-data-table-header-ASSIGNED_TO {
    min-width: 140px;
    width: 140px;
  }
  & td:nth-child(9),
  & th.fc-data-table-header-DUE_DATE {
    min-width: 140px;
    width: 140px;
  }
  & td:nth-child(10),
  & th.fc-data-table-header-STATUS {
    min-width: 140px;
    width: 140px;
  }
  & td:nth-child(11),
  & th.fc-data-table-header-LAST_EDITED_AT {
    min-width: 140px;
    width: 140px;
  }
  & td:nth-child(12),
  & th.fc-data-table-header-ACTIONS {
    min-width: 105px;
    width: 105px;
  }

  & td:not(:first-child):not(:last-child),
  & th:not(:first-child):not(:last-child) {
    padding: 0 8px;
  }

  & .fc-button.btn-show-request {
    min-width: 36px;
    padding: 0;
  }

  & tr.v-data-table__expanded.v-data-table__expanded__row {
    background-color: rgba(0, 86, 149, 0.07);
  }
  &.is-expanded-child {
    border-radius: 0;
    & tbody {
      background-color: rgba(0, 86, 149, 0.07);
    }
  }
}
</style>
