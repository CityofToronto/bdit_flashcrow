<template>
  <v-row class="mb-6" tag="dl">
    <v-col
      v-for="({ cols, name, value }, i) in entries"
      :key="i"
      :cols="cols">
      <dt class="subtitle-1">{{name}}</dt>
      <dd class="mt-1 display-1 font-weight-medium">
        <v-icon v-if="value === true">mdi-check</v-icon>
        <v-icon v-else-if="value === false">mdi-close</v-icon>
        <span v-else-if="value === null">None</span>
        <span v-else-if="Number.isFinite(value)">{{value | number}}</span>
        <span v-else>{{value}}</span>
      </dd>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'FcReportMetadata',
  props: {
    entries: Array,
  },
};
</script>
