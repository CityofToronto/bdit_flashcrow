<template>
  <section
    aria-labelledby="heading_global_filters"
    class="fc-global-filters default--text">
    <div class="align-center d-flex">
      <component
        :is="headerTag"
        class="headline" id="heading_global_filters">
        Filters
      </component>
      <v-spacer></v-spacer>
      <FcButton
        v-if="!readonly"
        type="tertiary"
        @click="setFiltersOpen(true)">
        Edit
      </FcButton>
    </div>
    <div class="align-center d-flex mt-2">
      <FcListFilterChips
        :filter-chips="filterChipsCommon"
        :readonly="readonly" />
    </div>
    <div class="align-center d-flex mt-2">
      <span class="font-weight-regular headline secondary--text">
        Collisions &#x2022;
      </span>
      <FcListFilterChips
        class="ml-1"
        :filter-chips="filterChipsCollision"
        :readonly="readonly" />
    </div>
    <div class="align-center d-flex mt-2">
      <span class="font-weight-regular headline secondary--text">
        Studies &#x2022;
      </span>
      <FcListFilterChips
        class="ml-1"
        :filter-chips="filterChipsStudy"
        :readonly="readonly" />
    </div>
  </section>
</template>

<script>
import { mapMutations } from 'vuex';

import { StudyType } from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcGlobalFilters',
  components: {
    FcButton,
    FcListFilterChips,
  },
  props: {
    headerTag: {
      type: String,
      default: 'h2',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // TODO: use actual chips
    filterChipsCollision() {
      return [
        { filter: 'emphasisAreas', label: 'KSI', value: null },
      ];
    },
    filterChipsCommon() {
      const dateRangeStart = DateTime.fromObject({
        year: 2002,
        month: 12,
        day: 1,
      });
      const dateRangeEnd = DateTime.fromObject({
        year: 2020,
        month: 12,
        day: 1,
      });
      const label = TimeFormatters.formatRangeDate({
        start: dateRangeStart,
        end: dateRangeEnd,
      });
      const value = { dateRangeStart, dateRangeEnd };
      return [
        { filter: 'dateRange', label, value },
      ];
    },
    filterChipsStudy() {
      return [
        { filter: 'studyTypes', label: 'TMC', value: StudyType.TMC },
      ];
    },
  },
  methods: {
    ...mapMutations(['setFiltersOpen']),
  },
};
</script>
