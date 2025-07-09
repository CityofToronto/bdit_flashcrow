<template>
  <section class="fc-report-parameters-warrant-traffic-signal-control">
     <fieldset class="my-8">
      <legend class="headline">Road Geometry Parameters</legend>
      <v-select
        v-model="internalValue.isTwoLane"
        class="my-4"
        hide-details
        :items="itemsIsTwoLane"
        label="Road Width" />
      <v-select
        v-model="internalValue.isXIntersection"
        class="my-4"
        hide-details
        :items="itemsIsXIntersection"
        label="Intersection Type" />
    </fieldset>
    <legend class="headline mt-4">Collision Parameters</legend>
    <FcDatePicker
      v-model="internalValue.startDate"
      class="my-4"
      label="Start Date (YYYY-MM-DD)">
    </FcDatePicker>
    <v-checkbox
      name="adequateTrial"
      v-model="internalValue.adequateTrial"
      label="Adequate Trial"
      :messages="[
        'Has adequate trial of less restrictive remedies failed to reduce collisions?',
      ]">
    </v-checkbox>
    <p class="mt-4">
      <i>Number of reported, potentially reduceable collisions
      (involving vehicles and/or pedestrians which under signalized
      conditions, would move on separate phases).</i>
    </p>
    <a href="https://secure.toronto.ca/council/agenda-item.do?item=2025.IE22.4">2025.IE22.4</a>
    <fieldset class="mt-8">
      <div v-for="i in 3" :key=i>

        <p style="font-weight: bold;">Year {{ i }} ({{ startDateRanges[i - 1] }})</p>
        <v-text-field
          label="All Severities"
          v-model.number="internalValue.allSeverities[i - 1]"
          :disabled="internalValue.startDate === null"
          min="0"
          :name="'preventablesByYear' + (i - 1)"
          type="number">
        </v-text-field>
        <v-text-field
          label="KSI"
          v-model.number="internalValue.allKsi[i - 1]"
          :disabled="internalValue.startDate === null"
          min="0"
          :name="'preventablesByYear' + (i - 1)"
          type="number">
        </v-text-field>
      </div>
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
