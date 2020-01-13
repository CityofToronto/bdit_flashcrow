<template>
  <div class="fc-report-parameters fc-report-parameters-warrant-traffic-signal-control">
    <hr class="mb-m">
    <v-btn
      class="fc-report-parameters-update"
      @click="$emit('update-report')">
      <v-icon left>mdi-sync</v-icon> Update
    </v-btn>
    <div class="form-group">
      <label class="tds-checkbox">
        <input
          type="checkbox"
          name="adequateTrial"
          v-model="internalValue.adequateTrial" />
        <span>
          <abbr
            title="Has adequate trial of less restrictive remedies failed to reduce collisions?">
            Adequate Trial?
          </abbr>
        </span>
      </label>
    </div>
    <div class="form-group">
      <label>
        <span>Collisions: Start Year</span>
        <input
          type="number"
          class="font-size-l full-width"
          min="1985"
          name="startYear"
          v-model.number="internalValue.startYear" />
      </label>
    </div>
    <div class="form-group">
      <label>
        <span>Collisions: Preventable, {{internalValue.startYear}}</span>
        <input
          type="number"
          class="font-size-l full-width"
          min="0"
          name="preventablesByYear0"
          v-model.number="internalValue.preventablesByYear[0]" />
      </label>
    </div>
    <div class="form-group">
      <label>
        <span>Collisions: Preventable, {{internalValue.startYear + 1}}</span>
        <input
          type="number"
          class="font-size-l full-width"
          min="0"
          name="preventablesByYear1"
          v-model.number="internalValue.preventablesByYear[1]" />
      </label>
    </div>
    <div class="form-group">
      <label>
        <span>Collisions: Preventable, {{internalValue.startYear + 2}}</span>
        <input
          type="number"
          class="font-size-l full-width"
          min="0"
          name="preventablesByYear2"
          v-model.number="internalValue.preventablesByYear[2]" />
      </label>
    </div>
    <div class="form-group">
      <label>
        <span>
          Collisions: Total, {{internalValue.startYear}} &ndash; {{internalValue.startYear + 2}}
        </span>
        <input
          type="number"
          class="font-size-l full-width"
          min="0"
          name="collisionsTotal"
          v-model.number="internalValue.collisionsTotal" />
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FcReportParametersWarrantTrafficSignalControl',
  props: {
    value: Object,
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>

<style lang="postcss">
.fc-report-parameters-update {
  float: right;
}
</style>
