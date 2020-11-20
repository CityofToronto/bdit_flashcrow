<template>
  <v-dialog
    v-model="internalValue"
    max-width="336"
    scrollable>
    <v-card role="dialog">
      <v-card-title>
        <h1 class="headline">Filter</h1>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <h2 class="body-1 mt-4">Collision Affects</h2>
        <v-checkbox
          v-for="emphasisArea in CollisionEmphasisArea.enumValues"
          :key="emphasisArea.name"
          v-model="internalFilters.emphasisAreas"
          class="mt-2"
          hide-details
          :label="emphasisArea.text"
          :value="emphasisArea"></v-checkbox>

        <h2 class="body-1 mt-4">Dates</h2>
        <v-checkbox
          v-model="internalFilters.applyDateRange"
          class="mt-2"
          hide-details
          label="Filter by date?"></v-checkbox>
        <FcDatePicker
          v-model="$v.internalFilters.dateRangeStart.$model"
          class="mt-2"
          :disabled="!internalFilters.applyDateRange"
          :error-messages="errorMessagesDateRangeStart"
          hide-details="auto"
          label="From (YYYY-MM-DD)"
          :max="now">
        </FcDatePicker>
        <FcDatePicker
          v-model="$v.internalFilters.dateRangeEnd.$model"
          class="mt-2"
          :disabled="!internalFilters.applyDateRange"
          :error-messages="errorMessagesDateRangeEnd"
          hide-details="auto"
          label="To (YYYY-MM-DD)"
          :max="now">
        </FcDatePicker>

        <h2 class="body-1 mt-4">Days of the Week</h2>
        <v-checkbox
          v-for="(label, i) in DAYS_OF_WEEK"
          :key="i"
          v-model="internalFilters.daysOfWeek"
          class="mt-2"
          hide-details
          :label="label"
          :value="i"></v-checkbox>

        <h2 class="body-1 mt-4">Time of Day</h2>
        <v-range-slider
          v-model="internalFilters.hoursOfDay"
          class="mt-11"
          hide-details
          :max="24"
          :min="0"
          thumb-label="always"></v-range-slider>

        <h2 class="body-1 mt-4">Weather</h2>
        <v-checkbox
          v-for="roadSurfaceCondition in CollisionRoadSurfaceCondition.enumValues"
          :key="roadSurfaceCondition.name"
          v-model="internalFilters.roadSurfaceConditions"
          class="mt-2"
          hide-details
          :label="roadSurfaceCondition.text"
          :value="roadSurfaceCondition"></v-checkbox>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
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
import ValidationsFilters from '@/lib/validation/ValidationsFilters';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogCollisionFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcDatePicker,
  },
  props: {
    filters: Object,
  },
  data() {
    return {
      CollisionEmphasisArea,
      CollisionRoadSurfaceCondition,
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
      internalFilters: { ...this.filters },
    };
  },
  computed: {
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
    ...mapState(['now']),
  },
  validations: {
    internalFilters: ValidationsFilters,
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
