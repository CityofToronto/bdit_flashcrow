<template>
  <div>
    <a :href="'/api/mvcr/' + sampleMvcrFileName" target="_blank">view</a>
    &nbsp;
    <button v-on:click="download">download</button>
  </div>
</template>

<script>

export default {
  name: 'MvcrLink',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    download() {
      return true;
    },
  },
  computed: {
    sampleMvcrFileName() {
      return 'sample_mvcr_redacted.pdf';
    },
  },
};
</script>
