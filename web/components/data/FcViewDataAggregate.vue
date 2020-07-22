<template>
  <div class="fc-view-data-aggregate">
    <h1 class="display-4 pa-5">TODO: implement aggregate view</h1>
  </div>
</template>

<script>
export default {
  name: 'FcViewDataAggregate',
  props: {
    locations: Array,
  },
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    locations() {
      this.syncLocations();
    },
  },
  created() {
    this.syncLocations();
  },
  methods: {
    async syncLocations() {
      this.loading = true;

      // TODO: actually implement this
      await new Promise((resolve) => {
        setTimeout(resolve, 400);
      });

      this.loading = false;
    },
  },
};
</script>
