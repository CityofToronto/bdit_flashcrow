<template>
  <div class="fc-report-count-metadata flex-container-row">
    <div class="flex-1">
      <div
        v-for="({ name, value }, i) in left"
        :key="'left_' + i"
        class="font-size-s">
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
        class="font-size-s">
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
</template>

<script>
export default {
  name: 'FcReportCountMetadata',
  props: {
    left: Array,
    right: Array,
  },
};
</script>
