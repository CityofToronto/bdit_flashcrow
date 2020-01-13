<template>
  <div class="fc-report-parameters fc-report-parameters-warrant-traffic-signal-control">
    <hr class="mb-m">
    <v-btn
      class="fc-report-parameters-update"
      @click="$emit('update-report')">
      <v-icon left>mdi-sync</v-icon> Update
    </v-btn>
    <v-checkbox
      name="adequateTrial"
      v-model="internalValue.adequateTrial">
      <template v-slot:label>
        <span>
          <abbr
            title="Has adequate trial of less restrictive remedies failed to reduce collisions?">
            Adequate Trial?
          </abbr>
        </span>
      </template>
    </v-checkbox>
    <v-text-field
      v-model.number="internalValue.startYear"
      label="Collisions: Start Year"
      min="1985"
      type="number"></v-text-field>
    <v-text-field
      v-for="i in 3"
      :key="internalValue.startYear + i - 1"
      v-model.number="internalValue.preventablesByYear[i - 1]"
      min="0"
      :name="'preventablesByYear' + (i - 1)"
      type="number">
      <template slot="label">
        <span>Collisions: Preventable, {{internalValue.startYear + i - 1}}</span>
      </template>
    </v-text-field>
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
