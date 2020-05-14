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
          v-model="internalEmphasisAreas"
          class="mt-2"
          hide-details
          :label="emphasisArea.text"
          :value="emphasisArea"></v-checkbox>

        <FcRadioGroup
          v-model="internalDatesFrom"
          class="mt-4"
          hide-details
          :items="[
            { label: '3 years', value: 3 },
            { label: '5 years', value: 5 },
            { label: '10 years', value: 10 },
            { label: 'All', value: -1 },
          ]">
          <template v-slot:legend>
            <h2 class="body-1 secondary--text">Dates from</h2>
          </template>
        </FcRadioGroup>

        <h2 class="body-1 mt-4">Days of the Week</h2>
        <v-checkbox
          v-for="(label, i) in DAYS_OF_WEEK"
          :key="i"
          v-model="internalDaysOfWeek"
          class="mt-2"
          hide-details
          :label="label"
          :value="i"></v-checkbox>

        <h2 class="body-1 mt-4">Time of Day</h2>
        <v-range-slider
          v-model="internalHoursOfDay"
          class="mt-11"
          hide-details
          :max="24"
          :min="0"
          thumb-label="always"></v-range-slider>

        <h2 class="body-1 mt-4">Weather</h2>
        <v-checkbox
          v-for="roadSurfaceCondition in CollisionRoadSurfaceCondition.enumValues"
          :key="roadSurfaceCondition.name"
          v-model="internalRoadSurfaceConditions"
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
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  CollisionEmphasisArea,
  CollisionRoadSurfaceCondition,
} from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogCollisionFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
    FcRadioGroup,
  },
  props: {
    datesFrom: Number,
    daysOfWeek: Array,
    emphasisAreas: Array,
    hoursOfDay: Array,
    roadSurfaceConditions: Array,
  },
  data() {
    return {
      CollisionEmphasisArea,
      CollisionRoadSurfaceCondition,
      DAYS_OF_WEEK: TimeFormatters.DAYS_OF_WEEK,
      internalDatesFrom: this.datesFrom,
      internalDaysOfWeek: this.daysOfWeek,
      internalEmphasisAreas: this.emphasisAreas,
      internalHoursOfDay: this.hoursOfDay,
      internalRoadSurfaceConditions: this.roadSurfaceConditions,
    };
  },
  computed: {
    internalFilters() {
      return {
        datesFrom: this.internalDatesFrom,
        daysOfWeek: this.internalDaysOfWeek,
        emphasisAreas: this.internalEmphasisAreas,
        hoursOfDay: this.internalHoursOfDay,
        roadSurfaceConditions: this.internalRoadSurfaceConditions,
      };
    },
  },
  methods: {
    actionClearAll() {
      this.internalDatesFrom = -1;
      this.internalDaysOfWeek = [];
      this.internalEmphasisAreas = [];
      this.internalHoursOfDay = [0, 24];
      this.internalRoadSurfaceConditions = [];
    },
    actionSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
