<template>
  <span>
    <v-icon
      v-if="value === true"
      aria-hidden="false"
      aria-label="Yes">
      mdi-check
    </v-icon>
    <v-icon
      v-else-if="value === false"
      aria-hidden="false"
      aria-label="No">
      mdi-close
    </v-icon>
    <template v-else-if="value === null">
      <br v-if="textNull === null" />
      <span v-else>{{textNull}}</span>
    </template>
    <span v-else-if="Number.isFinite(value)">{{value | number}}</span>
    <span v-else>{{value}}</span>
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
};
</script>
