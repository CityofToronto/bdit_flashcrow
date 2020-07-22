<template>
  <div class="fc-view-data-multi-edit">
    <h1 class="display-4 pa-5">TODO: implement multi-edit view</h1>
  </div>
</template>

<script>
export default {
  name: 'FcViewDataMultiEdit',
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
