<template>
  <v-row class="mb-6">
    <v-col
      v-for="({ cols, name, value }, i) in entries"
      :key="i"
      :cols="cols">
      <div class="subtitle-1">{{name}}</div>
      <div class="mt-1 display-1">
        <span v-if="value === null">None</span>
        <span v-else>{{value}}</span>
      </div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'FcReportCountMetadata',
  props: {
    entries: Array,
  },
};
</script>
