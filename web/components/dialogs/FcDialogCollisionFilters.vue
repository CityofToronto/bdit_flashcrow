<template>
  <v-dialog
    v-model="internalValue"
    max-width="336"
    scrollable>
    <v-card
      aria-labelledby="heading_dialog_collision_filters"
      role="dialog">
      <v-card-title class="shading">
        <h2 class="display-1" id="heading_dialog_collision_filters">
          Filter Collisions
        </h2>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="default--text">
        <fieldset class="mt-4">
          <legend class="headline">Collision Affects</legend>

          <v-checkbox
            v-for="emphasisArea in CollisionEmphasisArea.enumValues"
            :key="emphasisArea.name"
            v-model="internalFilters.emphasisAreas"
            class="mt-2"
            hide-details
            :label="emphasisArea.text"
            :value="emphasisArea"></v-checkbox>
        </fieldset>

        <fieldset class="mt-6">
          <legend class="headline">Date Range</legend>

          <FcDatePicker
            v-model="$v.internalFilters.dateRangeStart.$model"
            class="mt-2"
            :error-messages="errorMessagesDateRangeStart"
            hide-details="auto"
            label="From (YYYY-MM-DD)"
            :max="now">
          </FcDatePicker>
          <FcDatePicker
            v-model="$v.internalFilters.dateRangeEnd.$model"
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
            v-model="internalFilters.daysOfWeek"
            class="mt-2"
            hide-details
            :label="label"
            :value="i"></v-checkbox>
        </fieldset>

        <FcFilterHoursOfDay
          v-model="internalFilters.hoursOfDay"
          class="mt-6"
          :error-messages="errorMessagesHoursOfDay" />

        <fieldset class="mt-6">
          <legend class="headline">Weather</legend>

          <v-checkbox
            v-for="roadSurfaceCondition in CollisionRoadSurfaceCondition.enumValues"
            :key="roadSurfaceCondition.name"
            v-model="internalFilters.roadSurfaceConditions"
            class="mt-2"
            hide-details
            :label="roadSurfaceCondition.text"
            :value="roadSurfaceCondition"></v-checkbox>
        </fieldset>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.internalFilters.$invalid"
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogCollisionFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcDatePicker,
    FcFilterHoursOfDay,
  },
  props: {
    filters: Object,
  },
  data() {
    return {
      CollisionEmphasisArea,
      CollisionRoadSurfaceCondition,
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
      internalFilters: {
        ...this.filters,
        hoursOfDay: [...this.filters.hoursOfDay],
      },
    };
  },
  computed: {
    applyDateRange() {
      const { dateRangeStart, dateRangeEnd } = this.internalFilters;
      return dateRangeStart !== null || dateRangeEnd !== null;
    },
    errorMessagesDateRangeStart() {
      const errors = [];
      if (!this.$v.internalFilters.dateRangeStart.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    errorMessagesDateRangeEnd() {
      const errors = [];
      if (!this.$v.internalFilters.dateRangeEnd.requiredIfApplyDateRange) {
        errors.push('Please provide a date in YYYY-MM-DD format.');
      }
      return errors;
    },
    errorMessagesHoursOfDay() {
      const errors = [];
      if (!this.$v.internalFilters.hoursOfDay.fromBeforeTo) {
        errors.push('From hour must be before to hour');
      }
      return errors;
    },
    ...mapState(['now']),
  },
  validations: {
    internalFilters: ValidationsCollisionFilters,
  },
  watch: {
    applyDateRange() {
      this.internalFilters.applyDateRange = this.applyDateRange;
    },
  },
  methods: {
    actionClearAll() {
      this.internalFilters = {
        applyDateRange: false,
        dateRangeStart: null,
        dateRangeEnd: null,
        daysOfWeek: [],
        emphasisAreas: [],
        hoursOfDay: [0, 24],
        roadSurfaceConditions: [],
      };
    },
    actionSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
