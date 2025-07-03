<template>
  <section class="fc-report-parameters-warrant-traffic-signal-control">
    <v-checkbox
      name="adequateTrial"
      v-model="internalValue.adequateTrial"
      label="Adequate Trial"
      :messages="[
        'Has adequate trial of less restrictive remedies failed to reduce collisions?',
      ]">
    </v-checkbox>

    <fieldset class="my-4">
      <legend class="headline">Road Geometry Parameters</legend>
      <v-select
        v-model="internalValue.isTwoLane"
        class="mt-2"
        hide-details
        :items="itemsIsTwoLane"
        label="Road Width" />
      <v-select
        v-model="internalValue.isXIntersection"
        class="mt-2"
        hide-details
        :items="itemsIsXIntersection"
        label="Intersection Type" />
    </fieldset>

    <fieldset class="mt-4">
      <legend class="headline">Collision Parameters</legend>
      <FcDatePicker
        v-model="internalValue.startDate"
        class="mt-2"
        label="Start Date (YYYY-MM-DD)">
      </FcDatePicker>
      <v-text-field
        v-for="i in 3"
        :key="i"
        v-model.number="internalValue.preventablesByYear[i - 1]"
        :disabled="internalValue.startDate === null"
        min="0"
        :name="'preventablesByYear' + (i - 1)"
        type="number">
        <template v-slot:label>
          <span>Year {{i}}: {{startDateRanges[i - 1]}}</span>
        </template>
      </v-text-field>
    </fieldset>
  </section>
</template>

<script>
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcDatePicker from '@/web/components/inputs/FcDatePicker.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcReportParametersWarrantTrafficSignalControl',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcDatePicker,
  },
  data() {
    const itemsIsTwoLane = [
      { text: '1-2 lanes', value: true },
      { text: '3+ lanes', value: false },
    ];
    const itemsIsXIntersection = [
      { text: 'T (3-way)', value: false },
      { text: 'X (4-way)', value: true },
    ];

    return {
      itemsIsTwoLane,
      itemsIsXIntersection,
    };
  },
  computed: {
    startDateRanges() {
      const startDateRanges = new Array(3);
      if (this.internalStartValue === null) {
        for (let i = 0; i < 3; i++) {
          startDateRanges[i] = `Year ${i + 1}`;
        }
      } else {
        for (let i = 0; i < 3; i++) {
          const start = this.internalValue.startDate.plus({ years: i });
          const end = this.internalValue.startDate.plus({ days: -1, years: i + 1 });
          startDateRanges[i] = TimeFormatters.formatRangeDate({ start, end });
        }
      }
      return startDateRanges;
    },
  },
};
</script>
