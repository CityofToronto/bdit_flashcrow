<template>
  <span>
    <v-icon
      v-if="value === true"
      aria-hidden="false"
      aria-label="Yes" color="success" size="25">
      mdi-check
    </v-icon>
    <v-icon
      v-else-if="value === false"
      aria-hidden="false"
      aria-label="No" color="error" size="25">
      mdi-close
    </v-icon>
    <template v-else-if="value === null">
      <br v-if="textNull === null" />
      <span v-else>{{textNull}}</span>
    </template>
    <span v-else-if="Number.isFinite(value)">{{value | number}}</span>
    <template v-else>
      <span
        v-for="(line, i) in valueLines"
        :key="i">
        <br v-if="i > 0" />
        <span>{{line}}</span>
      </span>
    </template>
  </span>
</template>

<script>
export default {
  name: 'FcTextReportValue',
  props: {
    textNull: {
      type: String,
      default: null,
    },
    value: {
      type: [Boolean, Number, String],
      default: null,
    },
  },
  computed: {
    valueLines() {
      if (this.value === true
        || this.value === false
        || this.value === null
        || Number.isFinite(this.value)) {
        return [];
      }
      return this.value.split('\n');
    },
  },
};
</script>
