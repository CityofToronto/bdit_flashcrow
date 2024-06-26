<template>
  <nav
    aria-label="Quick filters for requests"
    class="fc-shortcut-chips">
    <ul class="pl-0">
      <v-chip
        v-for="({ label }, i) in SHORTCUT_CHIPS"
        :key="i"
        class="mr-1"
        :class="{
          'fc-shortcut-chip-active': activeShortcutChip === i,
        }"
        :color="activeShortcutChip === i ? 'primary' : null"
        outlined
        tag="li"
        @click="activeShortcutChip = i">
        {{label}}
      </v-chip>
    </ul>
  </nav>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { StudyRequestStatus } from '@/lib/Constants';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

const SHORTCUT_CHIPS = [
  {
    filters: {
      createdAtStart: null,
      createdAtEnd: null,
      dueDateStart: null,
      dueDateEnd: null,
      statuses: [],
      studyTypes: [],
      studyTypeOther: false,
    },
    label: 'All',
  }, {
    filters: {
      createdAtStart: null,
      createdAtEnd: null,
      dueDateStart: null,
      dueDateEnd: null,
      statuses: [StudyRequestStatus.REQUESTED],
      studyTypes: [],
      studyTypeOther: false,
    },
    label: 'Requested',
  }, {
    filters: {
      createdAtStart: null,
      createdAtEnd: null,
      dueDateStart: null,
      dueDateEnd: null,
      statuses: [
        StudyRequestStatus.ASSIGNED,
        StudyRequestStatus.REJECTED,
      ],
      studyTypes: [],
      studyTypeOther: false,
    },
    label: 'In Progress',
  }, {
    filters: {
      createdAtStart: null,
      createdAtEnd: null,
      dueDateStart: null,
      dueDateEnd: null,
      statuses: [
        StudyRequestStatus.CANCELLED,
        StudyRequestStatus.COMPLETED,
      ],
      studyTypes: [],
      studyTypeOther: false,
    },
    label: 'Closed',
  },
];

function filterArrayMatches(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  return arr1.every(x1 => arr2.includes(x1))
    && arr2.every(x2 => arr1.includes(x2));
}

function filterDateTimeMatches(dt1, dt2) {
  if (dt1 === null) {
    return dt2 === null;
  }
  if (dt2 === null) {
    return false;
  }
  return dt1.valueOf() === dt2.valueOf();
}

function filtersMatchShortcutChip(filters, { filters: chipFilters }) {
  return filters.closed === chipFilters.closed
    && filterDateTimeMatches(filters.createdAtStart, chipFilters.createdAtStart)
    && filterDateTimeMatches(filters.createdAtEnd, chipFilters.createdAtEnd)
    && filterDateTimeMatches(filters.dueDateStart, chipFilters.dueDateStart)
    && filterDateTimeMatches(filters.dueDateEnd, chipFilters.dueDateEnd)
    && filterArrayMatches(filters.statuses, chipFilters.statuses)
    && filterArrayMatches(filters.studyTypes, chipFilters.studyTypes)
    && filters.studyTypeOther === chipFilters.studyTypeOther;
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
          if (filtersMatchShortcutChip(this.filtersRequest, SHORTCUT_CHIPS[i])) {
            return i;
          }
        }
        return null;
      },
      set(activeShortcutChip) {
        const { userOnly } = this.filtersRequest;
        const { filters, label } = SHORTCUT_CHIPS[activeShortcutChip];
        this.setFiltersRequest({
          ...filters,
          userOnly,
        });
        this.setToastInfo(`You're now viewing ${label} requests.`);
      },
    },
    ...mapState('trackRequests', ['filtersRequest']),
  },
  methods: {
    ...mapMutations(['setToastInfo']),
    ...mapMutations('trackRequests', ['setFiltersRequest']),
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
