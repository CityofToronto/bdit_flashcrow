<template>
  <v-chip label small>
    {{text}}
  </v-chip>
</template>

<script>
export default {
  name: 'FcTextNumberTotal',
  props: {
    k: {
      type: Number,
      default: null,
    },
    n: Number,
  },
  computed: {
    text() {
      const { k, n } = this;
      if (k === null) {
        return n.toString();
      }
      return `${k} / ${n}`;
    },
  },
};
</script>
