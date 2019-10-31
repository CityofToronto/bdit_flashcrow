<template>
  <div class="fc-report-count-metadata">
    <div class="flex-container-row">
      <div class="flex-1">
        <div
          v-for="({ name, value }, i) in left"
          :key="'left_' + i"
          class="font-size-m">
          <strong v-if="value === null">
            {{name}}
          </strong>
          <span v-else>
            <strong>{{name}}: </strong>
            <span>{{value}}</span>
          </span>
        </div>
      </div>
      <div class="flex-1">
        <div
          v-for="({ name, value }, i) in right"
          :key="'left_' + i"
          class="font-size-m">
          <strong v-if="value === null">
            {{name}}
          </strong>
          <span v-else>
            <strong>{{name}}: </strong>
            <span>{{value}}</span>
          </span>
        </div>
      </div>
    </div>
    <div v-if="notes">
      <strong>Additional Notes: </strong>
      <span>{{notes}}</span>
    </div>
    <div v-else>No additional notes.</div>
  </div>
</template>

<script>
export default {
  name: 'FcReportCountMetadata',
  props: {
    left: Array,
    right: Array,
    notes: String,
  },
};
</script>
