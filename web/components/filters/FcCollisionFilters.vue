<template>
  <div>
    <fieldset class="mt-4">
      <legend class="headline">Collision Affects</legend>

      <v-checkbox
        v-for="emphasisArea in CollisionEmphasisArea.enumValues"
        :key="emphasisArea.name"
        v-model="internalValue.emphasisAreas"
        class="mt-2"
        hide-details
        :label="emphasisArea.text"
        :value="emphasisArea"></v-checkbox>
    </fieldset>

    <fieldset class="mt-6">
      <legend class="headline">Date Range</legend>

      <FcDatePicker
        v-model="$v.internalValue.dateRangeStart.$model"
        class="mt-2"
        :error-messages="errorMessagesDateRangeStart"
        hide-details="auto"
        label="From (YYYY-MM-DD)"
        :max="now">
      </FcDatePicker>
      <FcDatePicker
        v-model="$v.internalValue.dateRangeEnd.$model"
        class="mt-2"
        :error-messages="errorMessagesDateRangeEnd"
        hide-details="auto"
        label="To (YYYY-MM-DD)"
        :max="now">
      </FcDatePicker>
    </fieldset>

    <fieldset class="mt-6">
      <legend class="headline">Days of the Week</legend>

      <v-checkbox
        v-for="(label, i) in DAYS_OF_WEEK"
        :key="i"
        v-model="internalValue.daysOfWeek"
        class="mt-2"
        hide-details
        :label="label"
        :value="i"></v-checkbox>
    </fieldset>

    <FcFilterHoursOfDay
      v-model="internalValue.hoursOfDay"
      class="mt-6"
      :error-messages="errorMessagesHoursOfDay" />

    <fieldset class="mt-6">
      <legend class="headline">Weather</legend>

      <v-checkbox
        v-for="roadSurfaceCondition in CollisionRoadSurfaceCondition.enumValues"
        :key="roadSurfaceCondition.name"
        v-model="internalValue.roadSurfaceConditions"
        class="mt-2"
        hide-details
        :label="roadSurfaceCondition.text"
        :value="roadSurfaceCondition"></v-checkbox>
    </fieldset>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import {
  CollisionEmphasisArea,
  CollisionRoadSurfaceCondition,
} from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';
import ValidationsCollisionFilters from '@/lib/validation/ValidationsCollisionFilters';
import FcFilterHoursOfDay from '@/web/components/filters/FcFilterHoursOfDay.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcCollisionFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcDatePicker,
    FcFilterHoursOfDay,
  },
  data() {
    return {
      CollisionEmphasisArea,
      CollisionRoadSurfaceCondition,
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
    };
  },
  computed: {
    applyDateRange() {
      const { dateRangeStart, dateRangeEnd } = this.internalValue;
      return dateRangeStart !== null || dateRangeEnd !== null;
    },
    errorMessagesDateRangeStart() {
      const errors = [];
      if (!this.$v.internalValue.dateRangeStart.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    errorMessagesDateRangeEnd() {
      const errors = [];
      if (!this.$v.internalValue.dateRangeEnd.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    errorMessagesHoursOfDay() {
      const errors = [];
      if (!this.$v.internalValue.hoursOfDay.fromBeforeTo) {
        errors.push('From hour must be before to hour');
      }
      return errors;
    },
    ...mapState(['now']),
  },
  validations: {
    internalValue: ValidationsCollisionFilters,
  },
  watch: {
    applyDateRange() {
      this.internalValue.applyDateRange = this.applyDateRange;
    },
  },
};
</script>
