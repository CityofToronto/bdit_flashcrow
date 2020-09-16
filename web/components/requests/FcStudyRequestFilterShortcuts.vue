<template>
  <v-chip-group
    v-model="activeShortcutChip"
    active-class="fc-shortcut-chip-active"
    class="fc-shortcut-chips"
    color="primary"
    :mandatory="activeShortcutChip !== null">
    <v-chip
      v-for="({ text }, i) in SHORTCUT_CHIPS"
      :key="i"
      outlined>{{text}}</v-chip>
  </v-chip-group>
</template>

<script>
import { StudyRequestStatus } from '@/lib/Constants';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

const SHORTCUT_CHIPS = [
  {
    filters: {
      assignees: [],
      closed: false,
      createdAt: 0,
      lastEditedAt: 0,
      statuses: [],
      studyTypes: [],
    },
    text: 'All',
  }, {
    filters: {
      assignees: [],
      closed: false,
      createdAt: -1,
      lastEditedAt: 0,
      statuses: [],
      studyTypes: [],
    },
    text: 'New',
  }, {
    filters: {
      assignees: [],
      closed: false,
      createdAt: 0,
      lastEditedAt: -1,
      statuses: [],
      studyTypes: [],
    },
    text: 'Recently Updated',
  }, {
    filters: {
      assignees: [],
      closed: false,
      createdAt: 0,
      lastEditedAt: 0,
      statuses: [StudyRequestStatus.CANCELLED],
      studyTypes: [],
    },
    text: 'Cancelled',
  }, {
    filters: {
      assignees: [],
      closed: true,
      createdAt: 0,
      lastEditedAt: 0,
      statuses: [],
      studyTypes: [],
    },
    text: 'Closed',
  },
];

function filterArrayMatches(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every(x1 => arr2.includes(x1))
    && arr2.every(x2 => arr1.includes(x2));
}

function filtersMatchShortcutChip(filters, { filters: chipFilters }) {
  return filterArrayMatches(filters.assignees, chipFilters.assignees)
    && filters.closed === chipFilters.closed
    && filters.createdAt === chipFilters.createdAt
    && filters.lastEditedAt === chipFilters.lastEditedAt
    && filterArrayMatches(filters.statuses, chipFilters.statuses)
    && filterArrayMatches(filters.studyTypes, chipFilters.studyTypes);
}

export default {
  name: 'FcStudyRequestFilterShortcuts',
  mixins: [FcMixinVModelProxy(Object)],
  data() {
    return {
      SHORTCUT_CHIPS,
    };
  },
  computed: {
    activeShortcutChip: {
      get() {
        for (let i = 0; i < SHORTCUT_CHIPS.length; i++) {
          if (filtersMatchShortcutChip(this.internalValue, SHORTCUT_CHIPS[i])) {
            return i;
          }
        }
        return null;
      },
      set(activeShortcutChip) {
        const { userOnly } = this.internalValue;
        const { filters } = SHORTCUT_CHIPS[activeShortcutChip];
        this.internalValue = {
          ...filters,
          userOnly,
        };
      },
    },
  },
};
</script>

<style lang="scss">
.fc-shortcut-chips .v-chip.v-chip {
  &:not(:hover) {
    background-color: #fff !important;
  }
  &.fc-shortcut-chip-active {
    border: 1px solid var(--v-primary-base);
  }
}
</style>
