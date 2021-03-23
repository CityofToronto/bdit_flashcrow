<template>
  <v-card width="392">
    <v-card-title>
      <h2 class="headline">Filters</h2>
      <v-spacer></v-spacer>
      <FcButton
        v-if="!readonly"
        type="tertiary"
        @click="actionEdit">
        Edit
      </FcButton>
    </v-card-title>

    <v-card-text>
      <div>
        <FcListFilterChips
          :filter-chips="filterChipsCommon"
          :readonly="readonly" />
      </div>
      <div class="mt-2">
        <FcListFilterChips
          :filter-chips="filterChipsCollision"
          :readonly="readonly" />
      </div>
      <div class="mt-2">
        <FcListFilterChips
          :filter-chips="filterChipsStudy"
          :readonly="readonly" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { StudyType } from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcGlobalFilterBox',
  components: {
    FcButton,
    FcListFilterChips,
  },
  props: {
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
    actionEdit() {
      // TODO: implement this
    },
  },
};
</script>
