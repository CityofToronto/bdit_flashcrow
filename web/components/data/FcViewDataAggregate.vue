<template>
  <div class="fc-view-data-aggregate">
    <h1 class="display-4 pa-5">TODO: implement this</h1>
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
  async created() {
    this.loading = true;

    // TODO: actually implement this
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    this.loading = false;
  },
};
</script>
